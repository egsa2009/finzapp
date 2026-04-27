"""
Test suite para SMSParser.
Verifica parseo correcto de SMS de 4 bancos principales colombianos.
"""

import pytest
from datetime import datetime
from parser.sms_parser import SMSParser, TransactionType


class TestSMSParserBancolombia:
    """Tests para SMS de Bancolombia."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_bancolombia_compra_con_fecha_completa(self):
        """Test: SMS de compra en comercio con fecha completa dd/mm/yyyy."""
        text = "Bancolombia: Le informamos compra en RAPPI*RESTAURANTE por $45.000 el 23/04/2026. Saldo: $1.250.000"
        result = self.parser.parse(text, "BANCOLOMBIA")

        assert result.bank == "Bancolombia"
        assert result.amount == 45000.0
        assert result.merchant == "Rappi Restaurante"
        assert result.transaction_type == TransactionType.EXPENSE
        assert result.transaction_at is not None
        assert result.transaction_at.day == 23
        assert result.transaction_at.month == 4
        assert result.transaction_at.year == 2026
        assert result.confidence > 0.8

    def test_bancolombia_ingreso_nomina(self):
        """Test: SMS de abono/nómina a Bancolombia."""
        text = "Bancolombia: Abono de $2.500.000 por nomina EMPRESA SAS el 25/04/2026. Saldo: $3.750.000"
        result = self.parser.parse(text, "BANCOLOMBIA")

        assert result.bank == "Bancolombia"
        assert result.amount == 2500000.0
        assert result.transaction_type == TransactionType.INCOME
        assert result.transaction_at is not None
        assert result.transaction_at.day == 25
        assert result.confidence > 0.8

    def test_bancolombia_monto_con_comas(self):
        """Test: SMS con monto formato 45,000.00."""
        text = "Bancolombia: Compra en EXITO por $45,000.00 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")

        assert result.amount == 45000.0

    def test_bancolombia_transferencia_enviada(self):
        """Test: SMS de transferencia enviada."""
        text = "Bancolombia: Transferencia enviada por $500.000 a Cuenta destino el 20/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")

        assert result.amount == 500000.0
        assert result.transaction_type == TransactionType.TRANSFER_SENT
        assert result.confidence > 0.8


class TestSMSParserDavivienda:
    """Tests para SMS de Davivienda."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_davivienda_compra_sin_asteriscos(self):
        """Test: SMS de Davivienda con comercio sin asteriscos."""
        text = "Davivienda: Transaccion: Compra $35,500 EXITO CHAPINERO 23/04/26 Saldo: $850,200"
        result = self.parser.parse(text, "DAVIVIENDA")

        assert result.bank == "Davivienda"
        assert result.amount == 35500.0
        assert result.transaction_type == TransactionType.EXPENSE
        assert result.transaction_at is not None
        assert result.transaction_at.day == 23
        assert result.confidence > 0.8

    def test_davivienda_compra_con_fecha_corta(self):
        """Test: SMS con fecha formato yy (dos dígitos)."""
        text = "Davivienda: Compra por $72.300 en CARREFOUR el 15/03/26"
        result = self.parser.parse(text, "DAVIVIENDA")

        assert result.amount == 72300.0
        assert result.transaction_at is not None
        # Año debe ser interpretado como 2026
        assert result.transaction_at.year == 2026
        assert result.transaction_at.month == 3
        assert result.transaction_at.day == 15


class TestSMSParserNequi:
    """Tests para SMS de Nequi."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_nequi_transferencia_enviada(self):
        """Test: SMS de transferencia enviada via Nequi."""
        text = "Nequi: Transferiste $50.000 a Juan García. Saldo: $320.000"
        result = self.parser.parse(text, "NEQUI")

        assert result.bank == "Nequi"
        assert result.amount == 50000.0
        assert result.transaction_type == TransactionType.TRANSFER_SENT
        assert result.confidence > 0.7

    def test_nequi_recarga_celular(self):
        """Test: SMS de recarga de celular Nequi."""
        text = "Nequi: Recarga exitosa por $10.000 a 3001234567. Saldo: $100.000"
        result = self.parser.parse(text, "NEQUI")

        assert result.amount == 10000.0
        # Recarga es un tipo de gasto
        assert result.transaction_type in [TransactionType.EXPENSE, TransactionType.UNKNOWN]


class TestSMSParserMontos:
    """Tests para parseo de montos en diferentes formatos."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_monto_con_puntos_separadores(self):
        """Test: $1.250.000 (formato colombiano)."""
        text = "Compra por $1.250.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.amount == 1250000.0

    def test_monto_con_comas_y_puntos(self):
        """Test: $1,250.00 (formato internacional)."""
        text = "Compra por $1,250.00 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.amount == 1250.0

    def test_monto_sin_separadores(self):
        """Test: $50000 (sin separadores)."""
        text = "Transferencia $50000 a Juan García"
        result = self.parser.parse(text, "NEQUI")
        assert result.amount == 50000.0

    def test_monto_con_palabra_pesos(self):
        """Test: 45000 pesos (con palabra pesos)."""
        text = "Compra de 45000 pesos en comercio el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.amount == 45000.0


class TestSMSParserComercios:
    """Tests para extracción de nombre de comercio."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_comercio_con_asteriscos(self):
        """Test: RAPPI*RESTAURANTE -> Rappi Restaurante."""
        text = "Compra en RAPPI*RESTAURANTE por $45.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.merchant == "Rappi Restaurante"

    def test_comercio_mayusculas_simples(self):
        """Test: EXITO CHAPINERO -> Exito Chapinero."""
        text = "Compra $35.500 EXITO CHAPINERO 23/04/2026"
        result = self.parser.parse(text, "DAVIVIENDA")
        assert result.merchant == "Exito Chapinero"

    def test_comercio_con_numeros(self):
        """Test: Comercio con números se limpia."""
        text = "Compra en CARREFOUR123 por $50.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        # Debe extraer algo similar a "Carrefour"
        assert result.merchant is not None
        assert "carrefour" in result.merchant.lower()


class TestSMSParserFechas:
    """Tests para parseo de fechas en diferentes formatos."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_fecha_formato_ddmmyyyy(self):
        """Test: 23/04/2026."""
        text = "Compra por $45.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_at.day == 23
        assert result.transaction_at.month == 4
        assert result.transaction_at.year == 2026

    def test_fecha_formato_ddmmyy(self):
        """Test: 23/04/26."""
        text = "Compra por $45.000 el 23/04/26"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_at.year == 2026
        assert result.transaction_at.month == 4

    def test_fecha_con_guion(self):
        """Test: 23-04-2026."""
        text = "Compra por $45.000 el 23-04-2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_at.day == 23
        assert result.transaction_at.month == 4

    def test_fecha_formato_yyyymmdd(self):
        """Test: 2026-04-23."""
        text = "Compra por $45.000 el 2026-04-23"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_at.year == 2026
        assert result.transaction_at.month == 4
        assert result.transaction_at.day == 23


class TestSMSParserTiposTransaccion:
    """Tests para detección de tipo de transacción."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_tipo_gasto_con_compra(self):
        """Test: Detectar EXPENSE con palabra 'compra'."""
        text = "Compra en RAPPI por $45.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_type == TransactionType.EXPENSE

    def test_tipo_ingreso_con_abono(self):
        """Test: Detectar INCOME con palabra 'abono'."""
        text = "Abono de $2.500.000 por nomina el 25/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_type == TransactionType.INCOME

    def test_tipo_transfer_sent(self):
        """Test: Detectar TRANSFER_SENT con 'transferencia enviada'."""
        text = "Transferencia enviada por $500.000 el 20/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_type == TransactionType.TRANSFER_SENT

    def test_tipo_transfer_received(self):
        """Test: Detectar TRANSFER_RECEIVED con 'transferencia recibida'."""
        text = "Transferencia recibida por $500.000 de Juan García el 20/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_type == TransactionType.TRANSFER_RECEIVED

    def test_tipo_withdrawal(self):
        """Test: Detectar WITHDRAWAL con 'retiro'."""
        text = "Retiro en cajero por $100.000 el 20/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.transaction_type == TransactionType.WITHDRAWAL


class TestSMSParserConfidence:
    """Tests para cálculo de confidence score."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_confidence_completo(self):
        """Test: SMS con todos los campos debe tener alta confianza."""
        text = "Bancolombia: Compra en RAPPI*RESTAURANTE por $45.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        # Debe tener confianza alta (> 0.85)
        assert result.confidence > 0.85

    def test_confidence_incompleto(self):
        """Test: SMS sin comercio y sin fecha tiene confianza más baja."""
        text = "Bancolombia: Compra por $45.000"
        result = self.parser.parse(text, "BANCOLOMBIA")
        # Debe tener confianza moderada
        assert 0.3 < result.confidence < 0.7

    def test_confidence_solo_banco(self):
        """Test: SMS con solo banco identificado tiene baja confianza."""
        text = "Información de tu cuenta"
        result = self.parser.parse(text, "BANCOLOMBIA")
        # Debe tener baja confianza
        assert result.confidence < 0.3


class TestSMSParserEdgeCases:
    """Tests para casos especiales y edge cases."""

    def setup_method(self):
        """Setup para cada test."""
        self.parser = SMSParser()

    def test_empty_text(self):
        """Test: Texto vacío."""
        result = self.parser.parse("", "BANCOLOMBIA")
        assert result.amount is None
        assert result.confidence == 0.0

    def test_none_text(self):
        """Test: Texto None."""
        result = self.parser.parse(None, "BANCOLOMBIA")
        assert result.amount is None

    def test_unknown_sender(self):
        """Test: Sender desconocido."""
        text = "Compra por $45.000 el 23/04/2026"
        result = self.parser.parse(text, "UNKNOWN_BANK")
        assert result.bank == "UNKNOWN_BANK"
        assert result.amount == 45000.0

    def test_multiple_montos_extrae_primero(self):
        """Test: Múltiples montos, debe extraer el primero."""
        text = "Compra por $45.000 y otro cargo de $10.000 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        # Debe extraer el primer monto encontrado
        assert result.amount == 45000.0

    def test_saldo_no_confundido_con_transaccion(self):
        """Test: El saldo final no debe confundirse con el monto de transacción."""
        text = "Compra en RAPPI por $45.000 el 23/04/2026. Saldo: $1.250.000"
        result = self.parser.parse(text, "BANCOLOMBIA")
        # Debe extraer el monto de la compra, no el saldo
        assert result.amount == 45000.0

    def test_caracteres_especiales(self):
        """Test: SMS con caracteres especiales."""
        text = "Bancolombia: Compra en CAFÉ*BAR por $25.500 el 23/04/2026"
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.amount == 25500.0
        assert result.merchant is not None

    def test_texto_con_saltos_linea(self):
        """Test: SMS con saltos de línea."""
        text = """Bancolombia: Compra en RAPPI*RESTAURANTE
por $45.000
el 23/04/2026
Saldo: $1.250.000"""
        result = self.parser.parse(text, "BANCOLOMBIA")
        assert result.amount == 45000.0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
