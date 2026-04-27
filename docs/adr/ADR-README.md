# Architecture Decision Records (ADRs)

Este directorio contiene **Architecture Decision Records** — decisiones arquitectónicas importantes del proyecto FinzApp.

## ¿Qué es un ADR?

Un ADR es un documento que registra:
- **CONTEXTO:** Por qué tomamos la decisión
- **DECISIÓN:** Qué decidimos
- **ALTERNATIVAS:** Qué consideramos y por qué rechazamos
- **CONSECUENCIAS:** Qué cambió como resultado

## Beneficios

1. **Transparencia:** Todos entendemos por qué el sistema es así
2. **Onboarding:** Nuevos devs no preguntan "¿por qué NestJS y no Django?"
3. **Decisiones futuras:** Si necesitamos cambiar, vemos qué asumimos
4. **Accountability:** Quién decidió y cuándo

## Cómo Leer un ADR

1. Lee **Contexto** para entender el problema
2. Lee **Decisión** para ver qué elegimos
3. Lee **Alternativas** si necesitas entender trade-offs
4. Lee **Consecuencias** para saber el impacto

## Cómo Proponer un ADR

### Para decisiones GRANDES:

1. Crea `ADR-NNN-short-title.md` con template
2. Abre PR para revisión
3. Discute en equipo (30 min mínimo)
4. Requiere aprobación de Tech Lead
5. Merge a `main` con estado "Aceptado"

### Template

```markdown
# ADR-NNN: Título Descriptivo

**Estado:** Aceptado | Rechazado | En Propuesta | Deprecado
**Fecha:** Mes Año
**Autores:** Nombres
**Versión:** 1.0

## Contexto
[Describe el problema, restricciones, contexto]

## Decisión
[Qué decidimos y por qué]

## Alternativas Consideradas
| Alternativa | Pros | Contras |
|-------------|------|---------|
| Option A | | |
| Option B | | |
| Option C (ELEGIDA) | | |

## Consecuencias
[Qué cambió como resultado]

### Positivas
- Benefit 1
- Benefit 2

### Negativas
- Risk 1
- Risk 2

## Referencias
- Link 1
- Link 2
```

## ADRs Actuales

### ADR-001: Clean Architecture + Modular Monolith
**Estado:** Aceptado  
**Impacto:** Cómo organizamos todo el código backend  
**Cambio futuro:** Si escalamos a microservicios, esta decisión hace el cambio fácil

**Decisión:** Separa código en Domain → Application → Infrastructure → Presentation
**Impacto:** +30% más archivos, pero -80% acoplamiento

### ADR-002: Stack Tecnológico
**Estado:** Aceptado  
**Impacto:** Qué tecnologías usamos (NestJS, React, Python, Swift, Kotlin)  

**Decisión:** NestJS + React PWA + Python NLP + Swift/Kotlin companions
**Impacto:** TypeScript everywhere, comunidad activa, hiring fácil

### ADR-003: Captura de SMS/Push
**Estado:** Aceptado  
**Impacto:** Feature core: cómo capturamos transacciones del usuario

**Decisión:** PWA + Companion apps (iOS Shortcuts + Android BroadcastReceiver)
**Impacto:** iOS requires user setup (Shortcuts), Android automático

**Notas:**
- iOS: Apple forbids PWA SMS access → Workaround: Shortcuts automation
- Android: Native SMS access → BroadcastReceiver
- Result: Captura automática, privacy-first, GDPR-compliant

### ADR-004: Motor NLP
**Estado:** Aceptado  
**Impacto:** Cómo parseamos SMS y extraemos transacciones

**Decisión:** Regex patterns + spaCy NER, no transformers costosos
**Impacto:** <500ms latency, bajo costo, entrenable con feedback

## Estadísticas

| Métrica | Valor |
|---------|-------|
| Total ADRs | 4 |
| Aceptados | 4 |
| En Propuesta | 0 |
| Rechazados | 0 |
| Deprecados | 0 |

## Próximos ADRs en Consideración

- **ADR-005:** Estrategia de Caché (Redis vs In-Memory vs HTTP Cache)
- **ADR-006:** Escalabilidad de BD (Vertical vs Horizontal, Replicación)
- **ADR-007:** Autenticación 2FA (TOTP vs SMS vs Email)
- **ADR-008:** Monetización (Modelo Freemium vs B2B)

## Cómo Contribuir

1. Lee todos los ADRs para entender decisiones previas
2. Si propones cambio, crea ADR-NNN primero
3. Discute en Slack #architecture antes de escribir
4. Draft → PR → Team Discussion → Approved/Rejected

## Referencias

- Adr.github.io: https://adr.github.io/
- Documenting Decisions: https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions.html
- MADR Format: https://adr.github.io/madr/
