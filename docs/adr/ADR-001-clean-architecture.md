# ADR-001: Arquitectura Clean/Modular Monolith

**Estado:** Aceptado  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  
**Versión:** 1.0

## Contexto

FinzApp es una aplicación de finanzas personales que necesita ser escalable, mantenible y flexible para evolucionar. Se anticipan cambios significativos en:

- **Nuevas entidades:** Budgets, goals, inversiones, análisis predictivo
- **Nuevos integradores:** Más bancos, plataformas Fintech, APIs de terceros
- **Cambios en NLP:** Mejora continua de modelos con feedback del usuario
- **Múltiples canales:** PWA, apps nativas iOS/Android, API pública

El equipo es pequeño (2-5 desarrolladores) pero se espera crecimiento a 10+ personas en 12 meses. Necesitamos una arquitectura que:

1. Sea comprensible para nuevos miembros del equipo
2. Permita cambios sin afectar toda la aplicación
3. Facilite testing exhaustivo
4. Escale sin refactorizar completamente

Se consideraron tres opciones principales:

## Decisión

**Adoptamos Clean Architecture + Modular Monolith** para el backend (NestJS):

- **Domain Layer:** Entidades de negocio puras, agnósticas de framework
- **Application Layer:** Casos de uso (Services) que implementan lógica de negocio
- **Infrastructure Layer:** Implementaciones concretas (BD, APIs, colas)
- **Presentation Layer:** Controllers que manejan HTTP

**Estructura por módulo:**
```
src/
├── domain/              # Entidades, DTOs, interfaces de negocio
├── application/         # Services, casos de uso
├── infrastructure/      # Repositories, APIs externas, BD
├── presentation/        # Controllers, validadores
└── common/              # Guards, decoradores, utilidades
```

Cada módulo de negocio (Auth, Transaction, Analytics) sigue esta estructura, lo que permite:

1. **Independencia:** Cambiar implementación sin afectar dominio
2. **Testabilidad:** Inyectar mocks fácilmente en tests
3. **Escalabilidad:** Pasar módulos a microservicios sin refactoring
4. **Claridad:** Roles definidos (quién hace qué)

## Alternativas Consideradas

| Alternativa | Pros | Contras |
|-------------|------|---------|
| **Monolito Tradicional (Layered)** | Simple inicialmente, fácil de entender | Acoplamiento alto, difícil testear, boundaries no claros |
| **Microservicios Inmediatos** | Escalable desde día 1 | Overhead operacional, distributed transactions complejas, equipo pequeño no puede mantener |
| **Clean + Modular Monolith (ELEGIDA)** | Escalable a microservicios, clara separación, testeable | Requiere disciplina, más archivos inicialmente |
| **Onion Architecture** | Similar a Clean pero con énfasis en inversión de dependencias | Más abstracto, aprendizaje más pronunciado |

## Consecuencias

### Positivas

1. **Escalabilidad futura sin refactor:** Podemos mover Auth a un microservicio sin tocar la lógica de dominio
2. **Testing simplificado:** Services no dependen de BD real, se inyectan repositorios mock
3. **Onboarding más rápido:** Nuevos devs entienden dónde poner código nuevo
4. **Cambios independientes:** Cambiar forma de parsear SMS (Domain) no requiere tocar Controllers
5. **API clara:** Cada capa tiene responsabilidad definida

### Negativas

1. **Más archivos inicialmente:** Una característica simple necesita 5-6 archivos (Entity, DTO, Repository, Service, Controller)
2. **Curva de aprendizaje:** Nuevos devs necesitan entender el modelo mental
3. **Sobreingeniería inicial:** Para features muy simples, puede parecer overkill
4. **Sincronización entre capas:** DTOs pueden divergir de Entidades si no se cuida

## Implementación

### Patrón DTO (Data Transfer Object)

```typescript
// domain/dtos/auth/login.dto.ts (Request DTO)
export class LoginDto {
  email: string;
  password: string;
}

// domain/dtos/auth/auth-response.dto.ts (Response DTO)
export class AuthResponseDto {
  accessToken: string;
  refreshToken: string;
}

// Ventaja: Validación clara, decoupling de API changes
```

### Patrón Repository

```typescript
// infrastructure/repositories/user.repository.ts
@Injectable()
export class UserRepository {
  constructor(private db: Repository<User>) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.db.findOne({ where: { email } });
  }
}

// Ventaja: Service no conoce TypeORM, fácil swappear BD
```

### Inyección de Dependencias (NestJS)

```typescript
// presentation/auth/auth.controller.ts
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}
  
  @Post('login')
  async login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }
}

// application/auth.service.ts
@Injectable()
export class AuthService {
  constructor(
    private userRepository: UserRepository,
    private jwtService: JwtService,
  ) {}

  async login(dto: LoginDto): Promise<AuthResponseDto> {
    // Lógica de negocio
  }
}

// Ventaja: Fácil testear sin BD real
```

## Reglas de Dependencia

**Las dependencias siempre apuntan hacia adentro:**

```
Presentation → Application → Domain ← Infrastructure
                                ↑
                  (Infrastructure implementa interfaces del Domain)
```

**PROHIBIDO:**
- Domain depender de Infrastructure
- Infrastructure depender de Presentation
- Controllers con lógica de negocio

## Roadmap de Evolución

**Fase 1 (Actual):** Monolito modular con esta estructura

**Fase 2 (6-12 meses):** Si crecemos a 3+ backend engineers
```
finzapp-backend/          (API Gateway + Shared)
├── auth-service/         (Microservicio)
├── transaction-service/  (Microservicio)
└── analytics-service/    (Microservicio)
```

**Fase 3 (2+ años):** CQRS + Event Sourcing para análisis en tiempo real

## Métricas de Éxito

- Onboarding de nuevo dev: <2 horas para entender arquitectura
- Test coverage: >85%
- Time to add feature: <1 sprint
- Defects por feature: <0.5 bugs/feature
- Code review time: <30 min por PR

## Notas Técnicas

- Usar `@nestjs/common` para inyección de dependencias
- Validación con `class-validator` en DTOs
- Middleware para concerns transversales (logging, error handling)
- Usar TypeORM para abstracción de BD

## Referencias

- Clean Architecture: https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html
- NestJS Architecture: https://docs.nestjs.com/modules
- SOLID Principles: https://en.wikipedia.org/wiki/SOLID
- Domain-Driven Design: https://www.domainlanguage.com/ddd/

## Revisión

**Próxima revisión:** Después de 6 meses de uso o cuando el equipo alcance 8+ miembros
