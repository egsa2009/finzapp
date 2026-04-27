# NLP Service Architecture

## Descripción General

El servicio NLP de FinzApp es responsable de parsear mensajes SMS y push bancarios para extraer información estructurada de transacciones.

## Componentes

### 1. Parser Base (`sms_parser.py`)

**SMSParser** es la clase principal que implementa lógica de extracción.

```
SMSParser
├── parse(raw_text, sender) -> ParseResult
├── _extract_amount() -> float
├── _extract_merchant() -> str
├── _detect_transaction_type() -> TransactionType
├── _extract_date() -> datetime
├── _extract_time() -> datetime
└── _calculate_confidence() -> float
```

**Flujo:**

1. **Identificación de banco**: Mapear sender a nombre de banco
2. **Extracción de monto**: Aplicar regex patterns secuencialmente
3. **Extracción de comercio**: Buscar patrones "en COMERCIO" o antes de "por $"
4. **Detección de tipo**: Buscar palabras clave (compra, transferencia, etc.)
5. **Extracción de fecha/hora**: Parsear múltiples formatos
6. **Cálculo de confianza**: Score basado en campos extraídos

### 2. Normalizador (`normalizer.py`)

Convierte strings a formatos estándar.

```python
normalize_amount("$1.250.000") -> 1250000.0
normalize_merchant("RAPPI*RESTAURANTE") -> "Rappi Restaurante"
normalize_date("23/04/2026") -> datetime(2026, 4, 23)
normalize_time("14:32") -> datetime(..., 14, 32, 0)
```

**Casos especiales:**
- Formatos colombianos: "$1.250.000", "$1,250.00", "1250000"
- Fechas cortas: "23/04/26" -> 2026
- Acentos en meses: "23 de abril de 2026"

### 3. Parser de Push (`push_parser.py`)

Wrapper sobre SMSParser para notificaciones push Android.

- Identifica banco por package name (ej: `com.bancolombia.digitalbank`)
- Combina title + body para más contexto
- Delega lógica a SMSParser

### 4. FastAPI App (`main.py`)

**Endpoints:**

```
POST /parse
  Input: { raw_text, sender, source, [package_name], [title] }
  Output: { raw_text, parsed, extracted_fields, [error] }

POST /parse/batch
  Input: List[ParseRequest]
  Output: List[ParseResponse]

GET /health
  Output: { status, timestamp, version }

POST /feedback
  Input: { raw_text, sender, corrections, [notes] }
  Output: { status, message, timestamp }

GET /stats
  Output: { feedback_count, service_version }
```

## Patrones de Regex

### Montos

```python
AMOUNT_PATTERNS = [
    r'\$\s*([0-9]{1,3}(?:[.,][0-9]{3})*(?:[.,][0-9]{2})?)',  # $45.000
    r'([0-9]{1,3}(?:[.,][0-9]{3})+)\s*(?:pesos|cop)',        # 45.000 pesos
    r'por\s+\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*)',            # por $45.000
    r'valor[:\s]+\$?\s*([0-9]{1,3}(?:[.,][0-9]{3})*)',       # valor: $45.000
]
```

### Comercios

```python
MERCHANT_PATTERNS = [
    r'en\s+([A-Z][A-Z0-9*\s]+?)(?:\s+(?:por|el|a|en|,))',
    r'([A-Z][A-Z0-9*\s]+?)\s+por\s+\$',
    r'([A-Z][A-Z0-9*\s]+?)\s+(?:\d{1,2}[/\-]\d{1,2})',
    r'(?:en|compra|pago)\s+([A-Z\s*]+?)\s+(?:por|el|a las)',
]
```

### Fechas

```python
DATE_PATTERNS = [
    r'(\d{1,2}[/\-]\d{1,2}[/\-]\d{2,4})',      # 23/04/2026
    r'(\d{1,2})\s+de\s+([a-z]+)\s+de\s+(\d{4})',  # 23 de abril de 2026
    r'(\d{4}[/\-]\d{1,2}[/\-]\d{1,2})',        # 2026-04-23
]
```

## Palabras Clave

### Gastos (Expense)

```python
EXPENSE_KEYWORDS = [
    'compra', 'pago', 'retiro', 'débito', 'cargo', 'cobro', 'consumo',
    'transferencia enviada', 'pagaste', 'compraste', 'realizaste', 'giro',
]
```

### Ingresos (Income)

```python
INCOME_KEYWORDS = [
    'abono', 'ingreso', 'depósito', 'recarga', 'transferencia recibida',
    'consignación', 'crédito', 'recibiste', 'acreditó', 'nómina',
]
```

## Tipos de Transacción

```python
class TransactionType(Enum):
    EXPENSE = "expense"              # Compras, retiros
    INCOME = "income"                # Depósitos, recargas
    TRANSFER_SENT = "transfer_sent"  # Transferencias enviadas
    TRANSFER_RECEIVED = "transfer_received"  # Transferencias recibidas
    WITHDRAWAL = "withdrawal"        # Retiros en cajero
    DEPOSIT = "deposit"              # Depósitos
    UNKNOWN = "unknown"              # No determinado
```

## Bancos Soportados

```python
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
    # ... más bancos
}
```

## Cálculo de Confianza

Score de 0.0 a 1.0 basado en:

```
0.2 → Banco identificado
0.3 → Monto extraído y > 0
0.2 → Tipo de transacción detectado
0.15 → Comercio/destinatario extraído
0.15 → Fecha extraída
------
1.0 (máximo)
```

**Ejemplo:**
- SMS con banco + monto + tipo + fecha = 0.2 + 0.3 + 0.2 + 0.15 = 0.85
- SMS con solo banco + monto = 0.2 + 0.3 = 0.5

## Formato de ParseResult

```python
@dataclass
class ParseResult:
    raw_text: str
    bank: str
    amount: Optional[float]         # Monto normalizado
    merchant: Optional[str]         # Comercio normalizado
    transaction_type: TransactionType
    transaction_at: Optional[datetime]  # Fecha/hora combinadas
    confidence: float               # 0.0 - 1.0
    extracted_fields: Dict[str, Any]  # Campos en bruto
```

**Ejemplo de respuesta JSON:**

```json
{
  "raw_text": "Bancolombia: Compra en RAPPI*RESTAURANTE por $45.000 el 23/04/2026",
  "parsed": {
    "amount": 45000.0,
    "merchant": "Rappi Restaurante",
    "type": "expense",
    "transaction_at": "2026-04-23T00:00:00",
    "bank": "Bancolombia",
    "confidence": 0.95
  },
  "extracted_fields": {
    "amount": 45000.0,
    "merchant": "Rappi Restaurante",
    "transaction_type": "expense",
    "transaction_at": "2026-04-23T00:00:00"
  }
}
```

## Testing

Ver `tests/test_sms_parser.py` para suite completa.

**Clases de tests:**

- `TestSMSParserBancolombia`: 3 casos (compra, ingreso, transferencia)
- `TestSMSParserDavivienda`: 2 casos
- `TestSMSParserNequi`: 2 casos
- `TestSMSParserMontos`: 4 casos de normalización
- `TestSMSParserComercios`: 3 casos de extracción
- `TestSMSParserFechas`: 4 casos de parseo
- `TestSMSParserTiposTransaccion`: 5 casos de detección
- `TestSMSParserConfidence`: 3 casos de scoring
- `TestSMSParserEdgeCases`: 7 casos especiales

**Total: 33 tests**

```bash
# Ejecutar
pytest tests/test_sms_parser.py -v

# Con cobertura
pytest tests/test_sms_parser.py --cov=parser --cov-report=html
```

## Mejoras Futuras

1. **Machine Learning**
   - Entrenar modelo con feedback de usuarios
   - Fine-tuning con datos reales

2. **Soporte de más bancos**
   - Agregar nuevos senders y patterns
   - Crowdsource de ejemplos

3. **Detección de fraude**
   - Detectar transacciones sospechosas
   - Alertas automáticas

4. **Análisis de parámetros**
   - Logging de errores por tipo de SMS
   - Analytics de precisión por banco

5. **Caché de resultados**
   - Redis para SMS idénticos
   - Reducir latencia en batch

## Deployment

```bash
# Build imagen Docker
docker build -t finzapp-nlp:latest .

# Test localmente
docker run -p 8000:8000 finzapp-nlp:latest

# Push a Docker Hub
docker tag finzapp-nlp:latest myrepo/finzapp-nlp:latest
docker push myrepo/finzapp-nlp:latest

# Deploy en compose
docker-compose up -d nlp-service
```

## Monitoring

**Logs importantes:**

```
INFO - Parsed message from Bancolombia: amount=45000.0, merchant=Rappi Restaurante, confidence=0.95
ERROR - Error parsing message: Invalid date format
INFO - Feedback received for message from BANCOLOMBIA: corrections={'merchant': 'Corrected Name'}
```

**Metrics:**

```
GET /stats
{
  "feedback_count": 42,
  "service_version": "1.0.0"
}
```
