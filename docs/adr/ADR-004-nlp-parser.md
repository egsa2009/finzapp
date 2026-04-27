# ADR-004: Motor NLP para Parsing de Transacciones Bancarias

**Estado:** Aceptado  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  
**Versión:** 1.0

## Contexto

FinzApp captura SMS de bancos colombianos. Cada SMS es un **texto libre sin estructura** que contiene información crítica:

```
Ejemplos reales de SMS bancarios:

BANCOLOMBIA:
"Débito $50.000 a Supermercado D1. Saldo disponible: $450.000. Ref: 123456"

DAVIVIENDA:
"Transacción aprobada. Débito $200.000 en WIFI RESTAURANT el 26/04/2026 22:30"

NEQUI:
"Se te acaba de retirar $75.500 en Cajero Automático . Saldo: $200.000"

DAVIPLATA:
"Envío realizado a Juan Rodriguez por $30.000 el 26/04 15:45"

BBVA:
"Gasto: $12.500 en STARBUCKS CALI. 26/04 14:20. Saldo: $1.200.000"

SCOTIABANK:
"DEBITO EXITOSO: $150.000 en CARREFOUR, saldo: $800.000"
```

**Desafío:** Extraer **automáticamente**:
- `amount` (monto)
- `type` (DEBIT, CREDIT, TRANSFER)
- `beneficiary` (Supermercado D1, Starbucks, Juan Rodriguez)
- `date` (cuando ocurrió)
- `balance` (saldo después)
- `bank` (BANCOLOMBIA, DAVIVIENDA, etc)

**Requisitos:**
1. **Alta precisión** (>95%) para montos → crítico financiero
2. **Baja latencia** (<500ms) → user experience
3. **Bajo costo** → no usar APIs externas caras
4. **Entrenable** → feedback del usuario mejora precision
5. **Mantenible** → nuevos bancos sin refactor

## Decisión

**Hybrid Approach: Regex Patterns + spaCy NER**

```python
┌──────────────────────────────────────────────────────────┐
│ Raw SMS Text                                             │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 1. Bank Detection (Regex)                                │
│ if "BANCOLOMBIA" in text → bank = "BANCOLOMBIA"          │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 2. Bank-Specific Pattern Matching (Regex)                │
│ Extract: amount, type, date, balance                     │
│ Pattern examples:                                         │
│ - /\$[\d.]+/ for amounts                                │
│ - /(Débito|Crédito|Envío)/ for type                     │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 3. NER with spaCy (entity recognition)                   │
│ Extract: beneficiary, date, location                     │
│ Named Entity Recognition for merchants                   │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ 4. Validation & Fallback                                 │
│ If confidence < 80% → return with confidence score       │
│ User can correct → training feedback                     │
└──────────────────────────────────────────────────────────┘
                         ↓
┌──────────────────────────────────────────────────────────┐
│ ParsedTransaction                                        │
│ {                                                        │
│   amount: 50000,                                         │
│   type: "DEBIT",                                         │
│   beneficiary: "Supermercado D1",                        │
│   date: "2026-04-26T14:30:00",                          │
│   balance: 450000,                                       │
│   bank: "BANCOLOMBIA",                                   │
│   confidence: 0.98                                       │
│ }                                                        │
└──────────────────────────────────────────────────────────┘
```

### Implementación

**Paso 1: Regex Patterns (Fast, High Precision)**

```python
# src/patterns/bancolombia.patterns.py
BANCOLOMBIA_PATTERNS = {
    'amount': r'\$[\d.]+(?:\.\d{1,2})?',
    'type': r'(Débito|Crédito|Transferencia)',
    'beneficiary': r'(?:a|en|en )\s+([A-Z][A-Za-z\s]+)',
    'date': r'(?:el\s+)?(\d{1,2})/(\d{1,2})/(\d{4})',
    'balance': r'Saldo(?:\s+disponible)?:\s*\$[\d.]+',
}

def parse_bancolombia(sms_text: str) -> Dict[str, Any]:
    """Extract transaction from BANCOLOMBIA SMS."""
    result = {}
    
    # Extract amount
    amount_match = re.search(BANCOLOMBIA_PATTERNS['amount'], sms_text)
    if amount_match:
        amount_str = amount_match.group().replace('$', '').replace('.', '')
        result['amount'] = int(amount_str)
    
    # Extract type
    type_match = re.search(BANCOLOMBIA_PATTERNS['type'], sms_text)
    if type_match:
        type_str = type_match.group().lower()
        result['type'] = 'DEBIT' if 'débito' in type_str else 'CREDIT'
    
    # Extract beneficiary using NER
    beneficiary_match = re.search(BANCOLOMBIA_PATTERNS['beneficiary'], sms_text)
    if beneficiary_match:
        result['beneficiary'] = beneficiary_match.group(1).strip()
    
    return result
```

**Paso 2: spaCy NER (Flexible, Handles Edge Cases)**

```python
# src/services/nlp_engine.py
import spacy
from spacy.tokens import Doc

class NLPEngine:
    def __init__(self):
        # Cargar modelo pre-entrenado español
        self.nlp = spacy.load('es_core_news_md')
        # Añadir componentes custom
        self._add_custom_ner()
    
    def _add_custom_ner(self):
        """Add custom patterns for Colombian banks."""
        from spacy.language import Language
        
        @Language.component("bank_merchant_ner")
        def bank_merchant_ner(doc: Doc) -> Doc:
            # Custom merchant recognition
            merchants = ['STARBUCKS', 'CARREFOUR', 'D1', 'EXITO', 'CARREFOUR']
            for token in doc:
                if token.text.upper() in merchants:
                    token.ent_type_ = 'MERCHANT'
            return doc
        
        self.nlp.add_pipe("bank_merchant_ner")
    
    def extract_entities(self, sms_text: str) -> Dict[str, Any]:
        """Extract named entities from SMS."""
        doc = self.nlp(sms_text)
        
        entities = {
            'PERSON': [],
            'ORG': [],
            'DATE': [],
            'MONEY': [],
            'MERCHANT': [],
        }
        
        for ent in doc.ents:
            if ent.label_ in entities:
                entities[ent.label_].append(ent.text)
        
        return entities
```

**Paso 3: Confidence Scoring**

```python
def parse_sms(sms_text: str, bank: str) -> ParsedTransaction:
    """Main parsing function with confidence scoring."""
    
    # Get regex results
    regex_result = parse_by_bank(sms_text, bank)
    
    # Get NER results
    ner_result = nlp_engine.extract_entities(sms_text)
    
    # Merge results
    transaction = ParsedTransaction(
        amount=regex_result['amount'],
        type=regex_result['type'],
        bank=bank,
    )
    
    # Calculate confidence
    confidence_score = 0.0
    
    if regex_result['amount']:
        confidence_score += 0.4  # Amount is critical
    if regex_result['type']:
        confidence_score += 0.3  # Type is important
    if ner_result['MERCHANT']:
        confidence_score += 0.2  # Beneficiary is nice-to-have
    if regex_result['date']:
        confidence_score += 0.1  # Date can be inferred
    
    transaction.confidence = min(confidence_score, 1.0)
    
    # If confidence too low, flag for user review
    if transaction.confidence < 0.8:
        transaction.needs_verification = True
    
    return transaction
```

**Paso 4: Feedback Loop (ML Training)**

```python
# src/services/feedback_trainer.py
@app.post("/api/transactions/{transaction_id}/correct")
async def correct_transaction(
    transaction_id: str, 
    correction: CorrectionDto,
    current_user: User = Depends(get_current_user)
):
    """User corrects incorrect parse → train model."""
    
    transaction = await get_transaction(transaction_id)
    original_sms = transaction.raw_sms_text
    
    # Store correction
    correction_record = FeedbackEntry(
        sms_text=original_sms,
        bank=transaction.bank,
        parsed_incorrectly=transaction.to_dict(),
        corrected_values=correction.to_dict(),
        user_id=current_user.id,
        timestamp=datetime.now(),
    )
    await save_feedback(correction_record)
    
    # Optional: retrain spaCy model monthly with collected feedback
    # This improves beneficiary/merchant recognition over time
    
    return {"status": "correction recorded", "id": correction_record.id}
```

## Alternativas Consideradas

| Opción | Pros | Contras | Costo |
|--------|------|---------|-------|
| **Regex + spaCy (ELEGIDA)** | Fast, offline, low cost, trainable | Requires bank-specific patterns | Dev time |
| **Pure Regex** | Ultra-fast, simple | Brittle, no entity recognition | Low effort |
| **Transformers (BERT)** | SOTA accuracy | Slow (1-2s/parse), needs GPU, $$, overkill | $500+/GPU |
| **OpenAI API** | Zero-shot, no training | $$ per request, private data to OpenAI, slow, privacy | $1000+/month |
| **Custom LSTM** | Good accuracy | Needs lots training data, GPU, maintenance | $$ + expertise |
| **Manual User Entry** | 100% accurate | Zero automation, bad UX | 0 cost but defeats purpose |

## Consecuencias

### Positivas

1. **Bajo costo operacional:** Sin APIs externas, corre on-premise
2. **Privacidad:** SMS nunca sale de nuestro servidor
3. **Baja latencia:** Regex + spaCy en local = <500ms
4. **Escalable:** Procesar millones SMS sin quejas
5. **Entrenable:** Feedback del usuario mejora modelos
6. **Agnóstico de banco:** Agregar nuevo banco = agregar nuevo patrón

### Negativas

1. **Mantenimiento patterns:** Cada banco = nuevo patrón (solubilidad: template patterns)
2. **Confiabilidad variable:** Algunos SMS mal formateados no se parsean (solubilidad: user feedback)
3. **Beneficiary puede ser incorrecto:** spaCy puede confundir nombres (solubilidad: user correction)

### Degradation Graceful

Si el parser falla:
```python
# Scenario: Amount no se detecta
ParsedTransaction {
    confidence: 0.3,
    needs_verification: true,
    amount: null,
    type: 'DEBIT',
    beneficiary: 'Supermercado D1',
}

# PWA muestra: 
# "⚠️ Amount unclear. Parsed as DEBIT to D1. 
#  You entered: ??"
# → User enters $50.000 manually
# → Store correction for feedback training
```

## Métricas de Éxito

| Métrica | Target | Cómo medir |
|---------|--------|-----------|
| Amount accuracy | >99% | Corpus 1000 SMS, manual verification |
| Type accuracy | >98% | Debit/credit confusion <2% |
| Latency | <500ms | P95 latency |
| Coverage | >90% | SMS that parse vs total |
| User feedback | <5% | Corrections / total parsed |

## Roadmap de Mejora

**Fase 1 (MVP, 2 meses):**
- Regex patterns para 4 bancos principales (Bancolombia, Davivienda, Nequi, Daviplata)
- spaCy NER basic
- No ML training, confidence heuristic

**Fase 2 (6 meses, scale):**
- Patrones para 8 bancos más
- Monthly retraining con feedback
- Custom spaCy NER model entrenado con corpus colombiano

**Fase 3 (1+ años):**
- Fine-tuned transformer model (distilBERT en español)
- Detección de anomalías (transacción inusual?)
- Categorización automática (restaurante, supermercado, etc.)

## Testing

```python
# tests/test_sms_parser.py
import pytest
from src.services.sms_parser import parse_sms

@pytest.mark.parametrize("sms_text,expected", [
    (
        "Débito $50.000 a Supermercado D1. Saldo disponible: $450.000",
        {
            'amount': 50000,
            'type': 'DEBIT',
            'beneficiary': 'Supermercado D1',
            'balance': 450000,
        }
    ),
    (
        "Transacción aprobada. Débito $200.000 en WIFI RESTAURANT el 26/04/2026 22:30",
        {
            'amount': 200000,
            'type': 'DEBIT',
            'beneficiary': 'WIFI RESTAURANT',
        }
    ),
])
def test_parse_sms(sms_text, expected):
    result = parse_sms(sms_text, "DAVIVIENDA")
    
    assert result.amount == expected['amount']
    assert result.type == expected['type']
    assert result.confidence > 0.9
```

## Herramientas

- **spaCy:** NLP library Python
- **Regex:** Built-in pattern matching
- **Celery:** Async processing
- **Redis:** Cache parsed results
- **FastAPI:** Webhook endpoint

## Consideraciones de Privacidad

- No loguear SMS completo (solo parsed fields)
- Feedback data encriptado
- User puede borrar su feedback
- Modelos entrenados on-premise, no cloud

## Revisión

**Próxima revisión:** Después de 1 millón SMS parseados o si accuracy cae <95%
