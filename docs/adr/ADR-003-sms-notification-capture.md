# ADR-003: Estrategia de Captura de SMS y Notificaciones Push

**Estado:** Aceptado  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  
**Versión:** 1.0

## Contexto

La **característica core** de FinzApp es capturar automáticamente notificaciones de transacciones desde bancos colombianos (Bancolombia, Davivienda, Nequi, Daviplata, BBVA, Scotiabank, etc.).

Los bancos envían información mediante:
1. **SMS**: "Débito $50.000 a Supermercado D1. Saldo: $450.000"
2. **Push notifications**: Apps nativas del banco
3. **Combinado**: Un banco usa SMS, otro push, otro ambos

**Desafío crítico:** Las limitaciones de acceso a SMS y push son **radicalmente diferentes** entre iOS y Android:

### iOS - Limitaciones Severas

- **Apple NO PERMITE** a PWA acceso a SMS
- **Apple NO PERMITE** a PWA acceso a push de apps de terceros
- UserNotificationCenter está **restringido a apps nativas**
- Workaround oficial: **Apple Shortcuts** (iOS 12+) con automatización

### Android - Acceso Nativo Disponible

- Aplicación nativa puede recibir SMS via BroadcastReceiver
- Firebase Cloud Messaging (FCM) disponible
- PWA tiene acceso limitado

**Requerimiento:** Capturar SMS/push en **ambas plataformas** con **mínimo robo de batería**, **máxima privacidad**, **sin push notification spamming**.

## Decisión

**Hybrid Approach: PWA + Companion Apps (iOS/Android)**

```
┌─────────────────────────────────────────┐
│ User's Bank App (installed natively)    │
│ Receives: SMS + Push from bank          │
└─────────────────────────────────────────┘
         ↓                        ↓
    ┌─────────────────────────────────────┐
    │ FinzApp Companion (iOS/Android)     │
    │ BroadcastReceiver (Android)         │
    │ Shortcuts Automation (iOS)          │
    └─────────────────────────────────────┘
         ↓ (HTTPS + JWT)
    ┌─────────────────────────────────────┐
    │ FinzApp Backend Webhook             │
    │ /api/webhook/transaction            │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ NLP Service (Python)                │
    │ Parse SMS + Extract entities        │
    └─────────────────────────────────────┘
         ↓
    ┌─────────────────────────────────────┐
    │ PostgreSQL                          │
    │ Store transaction                   │
    └─────────────────────────────────────┘
         ↓ (WebSocket)
    ┌─────────────────────────────────────┐
    │ PWA React                           │
    │ Real-time dashboard update          │
    └─────────────────────────────────────┘
```

### Implementación iOS

**Apple Shortcuts (oficial workaround)**

```
iOS Automation Flow:
1. User configures "Shortcut" in Apple Shortcuts app
2. Trigger: "When bank app sends notification"
3. Action: "POST JSON to FinzApp API"
4. No battery drain: runs when bank notifies
5. No privacy concerns: user fully in control
```

**Ejemplo Shortcut:**

```
Ask: "What bank is this SMS from?"
  ↓
Get dictionary: SMS content
  ↓
Send HTTP POST to FinzApp API
  ↓
Show result: "Transaction captured: $50.000"
```

**Ventajas:**
- Apple-approved method
- No jailbreak needed
- User explicitly enables
- GDPR-compliant (no hidden access)

**Desventajas:**
- Requires user setup (tutorial in app)
- Manual trigger (pero automático una vez configurado)
- iOS 12+ required (covers 99%+ devices)

### Implementación Android

**BroadcastReceiver (nativo, permiso SMS_READ)**

```kotlin
// AndroidManifest.xml
<uses-permission android:name="android.permission.RECEIVE_SMS" />

// SMSReceiver.kt
class SMSReceiver : BroadcastReceiver() {
    override fun onReceive(context: Context, intent: Intent) {
        if (intent.action == "android.provider.Telephony.SMS_RECEIVED") {
            val smsArray = intent.getSerializableExtra("pdus") as? Array<Any>
            smsArray?.forEach { pdu ->
                val sms = SmsMessage.createFromPdu(pdu as ByteArray)
                val sender = sms.originatingAddress // +57XXXXXXXXX
                val body = sms.messageBody // "Débito $50.000 a D1..."
                
                // Send to FinzApp API
                sendToBackend(sender, body)
            }
        }
    }
}
```

**Ventajas:**
- Captura automática sin user interaction
- Batch processing (opcional)
- Low latency (<500ms)

**Desventajas:**
- Requires runtime permission (Android 6+)
- Battery impact (mitigated con debounce)
- Need companion app installed

### PWA Web (Fallback)

Para usuarios que **no quieran instalar app nativa**, ofrecemos:

```javascript
// PWA - Polling fallback
async function pollForTransactions() {
    // Si el usuario hizo login, mostrar opción de manual entry
    // O, si bank soporta, redireccionar a Open Banking API
}

// Nunca será automático, pero user puede:
// 1. Copy-paste SMS manualmente (rápido)
// 2. Conectar con Open Banking si disponible
// 3. Sincronizar histórico de transacciones
```

## Alternativas Consideradas

| Opción | Pros | Contras | Costo |
|--------|------|---------|-------|
| **PWA Solo** | 1 codebase, no app install | No SMS access iOS/Android, user upload manual | 0 |
| **Companion Nativo (elegida)** | Captura automática, privado | 2 codebases (iOS/Android), pero necesario | Dev |
| **Twilio/AWS SMS** | Centralizado, confiable | Requiere partnership bancos (imposible), $$ | 10k+/mes |
| **Root access exploit** | Automático | Jailbreak, violaría GDPR/privacidad, Apple ban | 0 pero RIP |
| **Backend SMS API** | Automático en backend | Requiere acceso bancario (no disponible) | N/A |
| **Open Banking (PSD2/Fintech API)** | Oficial, seguro | Disponible solo en EU/UK, Colombia aún no | Future |

## Consecuencias

### Positivas

1. **Privacy-first:** No pedimos permisos más allá de lo necesario
2. **User control:** User configura qué capturar, puede deshabilitar
3. **No battery drain:** Capture trigger-based, no polling
4. **GDPR/COLPRIVADA compliant:** Transparent, consentimiento explícito
5. **Escalable:** Millones de users sin backend SMS cost
6. **Banco-agnostico:** Funciona con cualquier banco que envíe SMS
7. **Real-time:** <1 segundo desde SMS a PWA update

### Negativas

1. **iOS Shortcut Setup:** ~3 min onboarding (solubilidad: tutorial interactivo en app)
2. **2 Apps:** Android + iOS (solubilidad: shared Kotlin/Swift code base posible futuro)
3. **Battery (Android):** BroadcastReceiver siempre activo (solubilidad: JobScheduler, batching)
4. **No SMS API access:** Bancos no dan acceso oficial (feature, no bug)

### Medidas de Mitigación

| Risk | Mitigación |
|------|-----------|
| iOS Shortcut demasiado complejo | Generar Shortcut export automático desde API |
| Battery drain Android | Debounce (max 1 request/10 sec), batching |
| User olvida configurar iOS | In-app tutorial, link directo a Shortcuts app |
| SMS parsing falla | Manual entry fallback, feedback loop → ML training |

## Seguridad

### Endpoint Webhook
```
POST /api/webhook/transaction
Authorization: Bearer {JWT token from app}
Content-Type: application/json

{
  "smsText": "Débito $50.000 a Supermercado D1...",
  "timestamp": "2026-04-26T14:30:00Z",
  "phoneNumber": "+57xxxxxxxxx",
  "source": "SMS" | "PUSH",
  "bankCode": "BANCOLOMBIA" | "DAVIVIENDA" | ...
}
```

**Validaciones:**
- JWT válido + user_id matches
- Rate limit: 100 requests/min por user
- SMS text min 10 chars, max 500 chars
- Deduplicate: same SMS dentro de 5 min = duplicado
- Phone number matches user's registered number

### Privacidad
- No logeamos SMS content (solo parsed transaction)
- No compartimos SMS con terceros
- User puede borrar transacción (soft delete)
- COLPRIVADA compliant: Términos claros

## Herramientas

| Plataforma | Herramienta |
|------------|------------|
| iOS | Apple Shortcuts app (built-in) |
| Android | BroadcastReceiver (Android SDK) |
| Automation | WorkManager (background scheduling) |

## Roadmap Futuro

**Fase 2 (6-12 meses):** Si Colombia adopta Open Banking (similar a PSD2 EU)
```
FinzApp Backend puede conectar directamente a API del banco
→ No need companion apps
→ Fully automatic + official
→ Higher security
```

**Fase 3 (2+ años):** Si Apple/Google abren SMS API
```
PWA gets native SMS access
→ Single codebase
→ Mejor UX
```

## Testing

```typescript
// Test webhook endpoint
describe('POST /webhook/transaction', () => {
  it('should accept SMS from authorized user', async () => {
    const response = await request(app)
      .post('/webhook/transaction')
      .set('Authorization', `Bearer ${validToken}`)
      .send({
        smsText: 'Débito $50.000 a D1. Saldo: $450.000',
        source: 'SMS',
        bankCode: 'BANCOLOMBIA'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('transactionId');
  });

  it('should deduplicate SMS within 5 minutes', async () => {
    // Send same SMS twice
    // Should return 409 Conflict on second
  });
});
```

## Documentación para Users

**En-app tutorial:**
1. iOS: "Link your bank SMS" → Opens Shortcuts app
2. Android: "Enable permissions" → Permission dialog
3. PWA: Shows real-time update demo

**FAQ:**
- Q: ¿FinzApp puede leer todos mis SMS?
  A: No, solo SMS que tú compartas via Shortcut (iOS) o permiso que tú autorices (Android)

- Q: ¿Está mi información segura?
  A: Sí, encriptada en tránsito (HTTPS) y en reposo (BD encriptada)

- Q: ¿Puedo deshabilitar en cualquier momento?
  A: Sí, iOS: delete Shortcut. Android: revoke permission.

## Revisión

**Próxima revisión:** Después de 6 meses de uso en producción o si Colombia adopta Open Banking
