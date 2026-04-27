"""
Parser de SMS bancarios colombianos.
Extrae monto, comercio, tipo de transacción, fecha y hora de mensajes SMS.

Ejemplo SMS soportados:
- Bancolombia: "Bancolombia: Le informamos compra en RAPPI*RESTAURANTE por $45.000 el 23/04/2026"
- Davivienda: "Davivienda: Transaccion: Compra $35,500 EXITO CHAPINERO 23/04/26"
- Nequi: "Nequi: Transferiste $50.000 a Juan García. Saldo: $320.000"
"""

import re
from datetime import datetime
from typing import Optional, Dict, Any
from dataclasses import dataclass, asdict
from enum import Enum

from .normalizer import normalize_amount, normalize_merchant, normalize_date, normalize_time


class TransactionType(str, Enum):
    """Tipos de transacciones soportadas."""
    EXPENSE = "expense"
    INCOME = "income"
    TRANSFER_SENT = "transfer_sent"
    TRANSFER_RECEIVED = "transfer_received"
    WITHDRAWAL = "withdrawal"
    DEPOSIT = "deposit"
    UNKNOWN = "unknown"


@dataclass
class ParseResult:
    """Resultado de parseo de SMS."""
    raw_text: str
    bank: str
    amount: Optional[float] = None
    merchant: Optional[str] = None
    transaction_type: TransactionType = TransactionType.UNKNOWN
    transaction_at: Optional[datetime] = None
    confidence: float = 0.0
    extracted_fields: Dict[str, Any] = None

    def __post_init__(self):
        if self.extracted_fields is None:
            self.extracted_fields = {}

    def to_dict(self) -> Dict[str, Any]:
        """Convierte resultado a diccionario JSON-serializable."""
        data = asdict(self)
        data['transaction_type'] = self.transaction_type.value
        if self.transaction_at:
            data['transaction_at'] = self.transaction_at.isoformat()
        else:
            data['transaction_at'] = None
        return data


class SMSParser:
    """Parser de SMS bancarios colombianos."""

    # Mapeo de senders a nombres de banco
    BANK_SENDERS = {
        "BANCOLOMBIA": "Bancolombia",
        "DAVIVIENDA": "Davivienda",
        "BBOGOTA": "Banco de Bogotá",
        "COLPATRIA": "Scotiabank Colpatria",
        "POPULAR": "Banco Popular",
        "OCCIDENTE": "Banco de Occidente",
        "NEQUI": "Nequi",
        "DAVIPLATA": "Daviplata",
        "BBVA": "BBVA Colombia",
        "ITAU": "Itaú",
        "SANTANDER": "Santander",
        "CITIBANK": "Citibank",
        "BIMBO": "Banco Bimbo",
    }

    # Palabras clave para detectar tipo de transacción
    EXPENSE_KEYWORDS = [
        'compra', 'pago', 'retiro', 'débito', 'cargo', 'cobro', 'consumo',
        'transferencia enviada', 'pagaste', 'compraste', 'realizaste',
        'giro', 'extracción', 'transacción', 'pago de servicios',
        'recarga celular', 'recarga a',
    ]

    # Palabras clave de transferencia enviada (mayor prioridad que EXPENSE)
    TRANSFER_SENT_KEYWORDS = [
        'transferiste', 'transferencia enviada', 'transferencia saliente',
        'giro enviado', 'enviaste',
    ]

    INCOME_KEYWORDS = [
        'abono', 'ingreso', 'depósito', 'transferencia recibida',
        'consignación', 'crédito', 'recibiste', 'acreditó', 'acreditamos',
        'nómina', 'reembolso', 'reintegro', 'recarga exitosa de',
    ]

    # Patrones regex para extraer montos — orden importa: más específicos primero
    AMOUNT_PATTERNS = [
        # $45.000 o $45,000.00 — con separadores de miles
        r'\$\s*([0-9]{1,3}(?:[.,][0-9]{3})+(?:[.,][0-9]{2})?)',
        # 45.000 pesos o 45,000 COP — con separadores
        r'([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:pesos|cop)',
        # $50000 — sin separadores (mínimo 4 dígitos para evitar falsos positivos)
        r'\$\s*([0-9]{4,})',
        # 45000 pesos — sin separadores
        r'([0-9]{4,})\s*(?:pesos|cop)',
        # "por $45.000" o "por 45000" (con o sin separadores)
        r'por\s+\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*)',
        # "valor: $45.000" o "valor $45000"
        r'valor[:\s]+\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*)',
        # "monto $45.000"
        r'monto[:\s]+\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*)',
    ]

    # Patrones para extraer comercio
    MERCHANT_PATTERNS = [
        # "en RAPPI*RESTAURANTE" o "en Rappi"
        r'en\s+([A-Z][A-Z0-9*\s]+?)(?:\s+(?:por|el|a|en|,))',
        # "COMERCIO por $"
        r'([A-Z][A-Z0-9*\s]+?)\s+por\s+\$',
        # "COMERCIO 23/04/2026"
        r'([A-Z][A-Z0-9*\s]+?)\s+(?:\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
        # Después de "en" y antes de "por"
        r'(?:en|compra|pago)\s+([A-Z\s*]+?)\s+(?:por|el|a las|,)',
    ]

    # Patrones de fecha/hora — ORDEN CRÍTICO: yyyy-mm-dd PRIMERO para evitar
    # que "2026-04-23" sea parseado como "26-04-23" (año 2023)
    DATE_PATTERNS = [
        # "2026-04-23" o "2026/04/23" — ISO format primero
        r'(\d{4}[/\-]\d{1,2}[/\-]\d{1,2})',
        # "23/04/2026" o "23-04-2026" — formato colombiano
        r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',
        # "el 23 de abril de 2026"
        r'el\s+(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})',
    ]

    TIME_PATTERNS = [
        # "14:32" o "14:32:00"
        r'(\d{1,2}:\d{2}(?::\d{2})?)',
        # "a las 14:32"
        r'a\s+las\s+(\d{1,2}:\d{2})',
        # "14:32 PM" o "2:32 AM"
        r'(\d{1,2}:\d{2})\s+(AM|PM|am|pm)',
    ]

    def __init__(self):
        """Inicializa el parser."""
        pass

    def parse(self, raw_text: str, sender: str) -> ParseResult:
        """
        Parsea un SMS bancario y extrae información de transacción.

        Args:
            raw_text: Texto del SMS
            sender: Identificador del sender (ej: "BANCOLOMBIA", "DAVIVIENDA")

        Returns:
            ParseResult con campos extraídos y confidence score
        """
        if not raw_text or not isinstance(raw_text, str):
            return ParseResult(
                raw_text=raw_text or "",
                bank="Unknown",
                confidence=0.0,
            )

        raw_text = raw_text.strip()
        bank = self.BANK_SENDERS.get(sender.upper(), sender)

        # Inicializar resultado
        result = ParseResult(
            raw_text=raw_text,
            bank=bank,
            extracted_fields={},
        )

        # 1. Extraer monto
        amount = self._extract_amount(raw_text)
        result.amount = amount
        if amount is not None:
            result.extracted_fields['amount'] = amount

        # 2. Extraer comercio
        merchant = self._extract_merchant(raw_text)
        result.merchant = merchant
        if merchant:
            result.extracted_fields['merchant'] = merchant

        # 3. Detectar tipo de transacción
        tx_type = self._detect_transaction_type(raw_text)
        result.transaction_type = tx_type
        result.extracted_fields['transaction_type'] = tx_type.value

        # 4. Extraer fecha
        date = self._extract_date(raw_text)
        if date:
            # 5. Extraer hora y combinar con fecha
            time = self._extract_time(raw_text)
            if time:
                date = date.replace(hour=time.hour, minute=time.minute, second=time.second)

            result.transaction_at = date
            result.extracted_fields['transaction_at'] = date.isoformat()

        # Calcular confidence score
        result.confidence = self._calculate_confidence(result)

        return result

    def _extract_amount(self, text: str) -> Optional[float]:
        """Extrae monto del texto usando patrones regex."""
        for pattern in self.AMOUNT_PATTERNS:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                amount_str = match.group(1)
                amount = normalize_amount(amount_str)
                if amount and amount > 0:
                    return amount

        return None

    def _extract_merchant(self, text: str) -> Optional[str]:
        """Extrae nombre del comercio del texto."""
        for pattern in self.MERCHANT_PATTERNS:
            matches = re.finditer(pattern, text)
            for match in matches:
                merchant_str = match.group(1)
                merchant = normalize_merchant(merchant_str)
                if merchant:
                    return merchant

        return None

    def _detect_transaction_type(self, text: str) -> TransactionType:
        """Detecta el tipo de transacción basándose en palabras clave."""
        text_lower = text.lower()

        # 1. Verificar transferencias enviadas (mayor prioridad)
        for keyword in self.TRANSFER_SENT_KEYWORDS:
            if keyword in text_lower:
                return TransactionType.TRANSFER_SENT

        # 2. Verificar transferencias recibidas
        if 'transferencia recibida' in text_lower or 'transferencia entrante' in text_lower:
            return TransactionType.TRANSFER_RECEIVED

        # 3. Verificar palabras clave de ingreso
        for keyword in self.INCOME_KEYWORDS:
            if keyword in text_lower:
                if 'depósito' in text_lower or 'consignación' in text_lower:
                    return TransactionType.DEPOSIT
                else:
                    return TransactionType.INCOME

        # 4. Verificar palabras clave de gasto
        for keyword in self.EXPENSE_KEYWORDS:
            if keyword in text_lower:
                if 'retiro' in text_lower or 'extracción' in text_lower:
                    return TransactionType.WITHDRAWAL
                else:
                    return TransactionType.EXPENSE

        return TransactionType.UNKNOWN

    def _extract_date(self, text: str) -> Optional[datetime]:
        """Extrae fecha del texto."""
        for pattern in self.DATE_PATTERNS:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                date_str = match.group(0)
                date = normalize_date(date_str)
                if date:
                    return date

        return None

    def _extract_time(self, text: str) -> Optional[datetime]:
        """Extrae hora del texto."""
        for pattern in self.TIME_PATTERNS:
            match = re.search(pattern, text)
            if match:
                time_str = match.group(1) if match.group(1) else match.group(0)
                time = normalize_time(time_str)
                if time:
                    return time

        return None

    def _calculate_confidence(self, result: ParseResult) -> float:
        """
        Calcula score de confianza basado en campos extraidos.

        Pesos:
        - banco identificado:                                0.20
        - monto extraido:                                    0.30
        - tipo basico (expense/income):                      0.10
        - tipo estructurado (transfer_sent/received/etc):    0.25
        - comercio extraido:                                 0.15
        - fecha extraida:                                    0.25

        Ejemplos:
        - banco+monto+expense sin fecha/merchant = 0.60 (< 0.7)
        - banco+monto+transfer_sent sin fecha/merchant = 0.75 (> 0.7)
        """
        confidence = 0.0

        if result.bank and result.bank != "Unknown":
            confidence += 0.20

        if result.amount is not None and result.amount > 0:
            confidence += 0.30

        structured_types = {
            TransactionType.TRANSFER_SENT,
            TransactionType.TRANSFER_RECEIVED,
            TransactionType.DEPOSIT,
            TransactionType.WITHDRAWAL,
        }
        if result.transaction_type in structured_types:
            confidence += 0.25
        elif result.transaction_type != TransactionType.UNKNOWN:
            confidence += 0.10

        if result.merchant:
            confidence += 0.15

        if result.transaction_at:
            confidence += 0.25

        return min(round(confidence, 2), 1.0)
