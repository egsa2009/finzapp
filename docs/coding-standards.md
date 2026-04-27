# FinzApp - Estándares de Código

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  

## 1. Principios Generales

- **DRY:** No repetir código
- **SOLID:** Princípios de diseño
- **Type Safety:** TypeScript strict mode
- **Clean Code:** Nombres claros, funciones pequeñas
- **Testability:** Código fácil de probar

## 2. TypeScript - Convenciones de Nombres

### Variables
```typescript
let isLoading = false;           // Booleanos: is/has
let transactionCount = 0;        // camelCase
const MAX_RETRIES = 3;           // Constantes: UPPER_SNAKE_CASE
```

### Funciones
```typescript
function calculateTotal(items: Item[]): number { }
const handleClick = () => { };                    // Handlers: handle/on
const getTransactionById = (id: string) => { };  // Getters: get
```

### Clases e Interfaces
```typescript
class UserService { }                    // PascalCase
interface User { }                       // Sin prefijo "I"
enum TransactionStatus { }               // PascalCase
type TransactionType = 'DEBIT' | 'CREDIT';
```

### Archivos
```
user.service.ts                  // Services: kebab-case
TransactionCard.tsx              // Components (React): PascalCase
useAuth.ts                        // Hooks: use + PascalCase
auth.types.ts                    // Types: kebab-case
```

## 3. NestJS Backend - Estructura

### Módulo
```typescript
@Module({
  imports: [TypeOrmModule.forFeature([User])],
  providers: [AuthService, JwtService],
  controllers: [AuthController],
  exports: [AuthService],
})
export class AuthModule {}
```

### Service (Business Logic)
```typescript
@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
    });
    if (!user) throw new UnauthorizedException();
    // Lógica de negocio...
  }
}
```

### Controller
```typescript
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() loginDto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(loginDto);
  }
}
```

### DTO (Data Transfer Object)
```typescript
export class CreateTransactionDto {
  @IsNumber()
  @Min(0.01)
  amount: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsString()
  notes?: string;
}
```

## 4. React - Componentes y Hooks

### Componente Funcional
```typescript
interface TransactionCardProps {
  transaction: Transaction;
  onSelect?: (id: string) => void;
}

const TransactionCard: FC<TransactionCardProps> = memo(
  ({ transaction, onSelect }) => {
    return (
      <div className="p-4 border rounded-lg">
        <h3>{transaction.description}</h3>
        <span>{transaction.amount}</span>
      </div>
    );
  }
);

TransactionCard.displayName = 'TransactionCard';
export default TransactionCard;
```

### Hook Personalizado
```typescript
export const useTransaction = () => {
  const { data: transactions, isLoading } = useQuery({
    queryKey: ['transactions'],
    queryFn: () => transactionApi.getAll(),
  });

  return { transactions, isLoading };
};
```

### Redux Slice
```typescript
const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuth: (state, action) => {
      state.isAuthenticated = true;
      state.user = action.payload;
    },
  },
});
```

## 5. Python (NLP Service)

### Naming
```python
transaction_amount = 50000        # snake_case
def parse_sms_message(text: str): pass

class SMSParser:                  # PascalCase
    pass

MAX_RETRIES = 3                   # UPPER_SNAKE_CASE
```

### Servicio
```python
from typing import Optional, Dict

class SMSParser:
    """Parser for Colombian bank SMS messages."""
    
    def __init__(self, patterns: Dict):
        self.patterns = patterns

    def parse(self, sms_text: str) -> Optional[ParsedTransaction]:
        """Extract transaction info from SMS."""
        try:
            bank = self._detect_bank(sms_text)
            return self._parse_by_bank(sms_text, bank)
        except Exception as e:
            logger.error(f"Parse error: {e}")
            return None
```

## 6. ESLint y Prettier

### .eslintrc.json
```json
{
  "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended", "prettier"],
  "rules": {
    "no-console": ["warn", {"allow": ["warn", "error"]}],
    "prefer-const": "error",
    "@typescript-eslint/no-explicit-any": "warn"
  }
}
```

### .prettierrc
```json
{
  "semi": true,
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2
}
```

## 7. Testing

### Unit Test (Jest)
```typescript
describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [AuthService, { provide: JwtService, useValue: {} }],
    }).compile();
    service = module.get<AuthService>(AuthService);
  });

  it('should login successfully', async () => {
    const result = await service.login({ email: 'test@example.com', password: 'pass' });
    expect(result.accessToken).toBeDefined();
  });
});
```

## 8. Git Commits (Conventional)

```
feat: add transaction categorization
fix: correct JWT expiration
docs: update API documentation
style: format code
refactor: simplify service
test: add unit tests
chore: upgrade dependencies
perf: optimize queries
```

## 9. Checklist Pre-commit

- [ ] ESLint pass (`npm run lint`)
- [ ] Tests pass (`npm test`)
- [ ] TypeScript strict (`npx tsc --noEmit`)
- [ ] 80% code coverage minimum
- [ ] No console.log (except warn/error)
- [ ] Error handling proper
- [ ] Docs updated
- [ ] No secrets in code

## 10. Herramientas Recomendadas

| Herramienta | Propósito |
|-------------|----------|
| ESLint | Linting |
| Prettier | Formato |
| Husky | Git hooks |
| Jest | Testing |
| SonarQube | Calidad de código |

---

**Referencias:**
- TypeScript: https://www.typescriptlang.org/docs
- NestJS: https://docs.nestjs.com
- React: https://react.dev
- PEP 8 (Python): https://pep8.org
