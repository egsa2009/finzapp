"""
Parser de notificaciones push bancarias.
Similar a SMS pero con identificación por package name de Android.

Ejemplo push soportados:
- Bancolombia app: "com.bancolombia.digitalbank" → "Compra en RAPPI*RESTAURANTE por $45.000"
- Davivienda app: "com.davivienda.bdigitalapp" → "Transaccion: Compra $35,500 EXITO"
- Nequi app: "com.nequi.mobilebanking" → "Transferiste $50.000 a Juan García"
"""

from typing import Optional
from .sms_parser import SMSParser, ParseResult


class PushParser:
    """Parser de push notifications de aplicaciones bancarias."""

    # Mapeo de Android package names a nombres de banco
    BANK_PACKAGES = {
        "com.bancolombia.digitalbank": "Bancolombia",
        "com.davivienda.bdigitalapp": "Davivienda",
        "com.davivienda.daviplataapp": "Daviplata",
        "com.nequi.mobilebanking": "Nequi",
        "com.bbva.bbvanetcash": "BBVA Colombia",
        "com.itau.app": "Itaú",
        "com.santander.mobile": "Santander",
        "com.citibank.android": "Citibank",
        "com.bimbo.android": "Banco Bimbo",
        "com.occidente.movil": "Banco de Occidente",
        "com.bancodelafamilia.movil": "Banco de la Familia",
    }

    def __init__(self):
        """Inicializa el parser de push."""
        self.sms_parser = SMSParser()

    def parse(
        self,
        raw_text: str,
        package_name: Optional[str] = None,
        title: Optional[str] = None,
    ) -> ParseResult:
        """
        Parsea una notificación push bancaria.

        Args:
            raw_text: Cuerpo del mensaje (notification body)
            package_name: Package name de la app Android (opcional)
            title: Título de la notificación (opcional)

        Returns:
            ParseResult con campos extraídos
        """
        # Determinar banco por package name
        bank = "Unknown"
        if package_name and package_name in self.BANK_PACKAGES:
            bank = self.BANK_PACKAGES[package_name]

        # Construir sender equivalente para el parser SMS
        sender = self._get_sender_from_package(package_name)

        # Combinar title y body para extraer más contexto
        combined_text = raw_text
        if title:
            combined_text = f"{title}. {raw_text}"

        # Usar SMSParser para extraer información
        result = self.sms_parser.parse(combined_text, sender)

        # Asegurar que el banco esté bien identificado
        if bank != "Unknown":
            result.bank = bank

        return result

    def _get_sender_from_package(self, package_name: Optional[str]) -> str:
        """
        Convierte package name a sender string para SMSParser.

        Args:
            package_name: Android package name

        Returns:
            Sender string (ej: "BANCOLOMBIA")
        """
        if not package_name:
            return "UNKNOWN"

        # Extraer nombre de banco del package name
        package_lower = package_name.lower()

        if "bancolombia" in package_lower:
            return "BANCOLOMBIA"
        elif "davivienda" in package_lower:
            return "DAVIVIENDA"
        elif "daviplata" in package_lower:
            return "DAVIPLATA"
        elif "nequi" in package_lower:
            return "NEQUI"
        elif "bbva" in package_lower:
            return "BBVA"
        elif "itau" in package_lower:
            return "ITAU"
        elif "santander" in package_lower:
            return "SANTANDER"
        elif "citibank" in package_lower:
            return "CITIBANK"
        elif "bimbo" in package_lower:
            return "BIMBO"
        elif "occidente" in package_lower:
            return "OCCIDENTE"

        return "UNKNOWN"
