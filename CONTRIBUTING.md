# Guía de Contribución - FinzApp

Agradecemos tu interés en contribuir a FinzApp. Este documento describe el proceso y las pautas.

## Código de Conducta

Esperamos que todos los contribuyentes sigan nuestro código de conducta:
- Sé respetuoso con otros
- No tolerar discriminación
- Reportar comportamiento inadecuado a info@finzapp.co

## Cómo Contribuir

### 1. Reporting Bugs

**Antes de reportar:**
- Revisa issues existentes
- Prueba en la rama `develop`
- Recolecta logs y stacktraces

**Al reportar:**

```markdown
## Descripción
[Describe el bug claramente]

## Pasos para reproducir
1. ...
2. ...
3. ...

## Comportamiento esperado
[Qué debería pasar]

## Comportamiento actual
[Qué sucede]

## Logs/Screenshots
[Adjuntar archivos relevantes]

## Environment
- OS: [Windows 11 / macOS / Linux]
- Node: 20.x
- Python: 3.12.x
- Docker: 24.x
```

### 2. Sugiriendo Mejoras

```markdown
## Descripción
[Descripción clara de la mejora]

## Motivación
[Por qué esto sería útil]

## Soluciones Alternativas
[Otras formas de resolver esto]

## Contexto Adicional
[Información adicional]
```

### 3. Submitting Code

#### 3.1 Setup de Desarrollo

```bash
# Fork el repositorio
# Clone tu fork
git clone https://github.com/YOUR_USERNAME/finzapp.git
cd finzapp

# Añadir upstream
git remote add upstream https://github.com/original/finzapp.git

# Instalar dependencias
make dev
```

#### 3.2 Crear una Rama

```bash
# Actualizar desde upstream
git fetch upstream
git checkout develop
git merge upstream/develop

# Crear rama feature
git checkout -b feature/my-amazing-feature

# O para bugfix
git checkout -b fix/bug-description
```

#### 3.3 Hacer Cambios

**Pautas de código:**

1. **Estilo**
   - Backend: NestJS style guide, ESLint config
   - Frontend: Prettier + ESLint
   - Python: PEP 8, Black formatter
   
2. **Commits**
   ```bash
   # Usar mensajes descriptivos
   git commit -m "feat: Add SMS parsing for Bancolombia"
   git commit -m "fix: Normalize merchant names with asterisks"
   git commit -m "test: Add test cases for date parsing"
   
   # Formato: type(scope): description
   # type: feat, fix, docs, style, test, refactor, ci
   # scope: backend, frontend, nlp, docker, etc.
   ```

3. **Tests**
   - Escribe tests para nuevas features
   - Mantén/mejora cobertura (>80%)
   - Todos los tests deben pasar
   
4. **Documentación**
   - Actualiza README si cambias comportamiento
   - Comenta código complejo
   - Actualiza CHANGELOG.md

#### 3.4 Pushear y Crear PR

```bash
# Push a tu fork
git push origin feature/my-amazing-feature

# En GitHub: Abrir Pull Request
# - Llenar template
# - Referenciar issues (#123)
# - Esperar review
```

**Template de PR:**

```markdown
## Descripción
[Qué hace este PR]

## Tipo de cambio
- [ ] Bug fix
- [ ] Nueva feature
- [ ] Breaking change
- [ ] Documentación

## Issues Relacionados
Closes #123

## Cambios propuestos
- [ ] Item 1
- [ ] Item 2

## Cómo probar
1. ...
2. ...

## Screenshots/Logs
[Adjuntar si aplica]

## Checklist
- [ ] Código sigue style guide
- [ ] Tests pasan
- [ ] Documentación actualizada
- [ ] No hay breaking changes sin aviso
```

## Estándares de Código

### Backend (NestJS/TypeScript)

```typescript
// ✓ Bien
@Controller('transactions')
export class TransactionController {
  constructor(private readonly service: TransactionService) {}
  
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Transaction> {
    return this.service.findOne(id);
  }
}

// ✗ Mal
export class TransactionController {
  findOne(id) {  // Sin tipos
    return this.service.findOne(id);  // Sin async/await
  }
}
```

### Frontend (React/TypeScript)

```typescript
// ✓ Bien
interface TransactionProps {
  id: string;
  amount: number;
  merchant: string;
}

const TransactionCard: React.FC<TransactionProps> = ({ id, amount, merchant }) => {
  return <div>{merchant}: ${amount}</div>;
};

// ✗ Mal
const TransactionCard = (props) => {  // Sin tipos
  return <div>{props.merchant}: ${props.amount}</div>;
};
```

### Python (NLP Service)

```python
# ✓ Bien
def normalize_amount(text: str) -> Optional[float]:
    """Convierte string de monto a float."""
    if not text:
        return None
    
    # Lógica...
    return float(cleaned_text)

# ✗ Mal
def normalize_amount(text):  # Sin tipos
    # No hay docstring
    return float(text)
```

## Proceso de Review

1. **Automated checks**
   - Linters pasan
   - Tests pasan (100%)
   - No hay security warnings

2. **Code Review**
   - Al menos 1 maintainer review
   - Solicitar cambios si es necesario
   - Discussiones constructivas

3. **Approval & Merge**
   - Squash commits al merge
   - Usar mensaje de commit descriptivo
   - Deletear rama después

## Testing

### Coverage mínimo: 80%

```bash
# Backend
cd backend && npm run test:coverage
# Abrir coverage/index.html

# Frontend
cd frontend && npm run test:coverage
# Abrir coverage/index.html

# NLP
cd nlp-service && pytest --cov=parser --cov-report=html
# Abrir htmlcov/index.html
```

### Convenciones de Testing

```typescript
// Backend
describe('TransactionService', () => {
  describe('parse', () => {
    it('should extract amount from SMS', async () => {
      const result = await service.parse(smsText);
      expect(result.amount).toBe(45000);
    });
    
    it('should handle invalid input gracefully', async () => {
      await expect(service.parse('')).rejects.toThrow();
    });
  });
});
```

```python
# NLP
class TestSMSParser:
    def setup_method(self):
        self.parser = SMSParser()
    
    def test_parse_bancolombia_expense(self):
        result = self.parser.parse(
            "Bancolombia: Compra...",
            "BANCOLOMBIA"
        )
        assert result.amount == 45000.0
        assert result.confidence > 0.8
```

## Documentación

- **Inline comments**: Explicar el "por qué", no el "qué"
- **Docstrings**: Python y TypeScript
- **README**: Mantener actualizado
- **API docs**: JSDoc para endpoints
- **CHANGELOG**: Anotar cambios importantes

```python
def extract_amount(text: str) -> Optional[float]:
    """
    Extrae monto del texto usando patrones regex.
    
    Soporta formatos colombianos:
    - "$1.250.000" (formato local)
    - "$1,250.00" (formato internacional)
    - "1250000" (sin separadores)
    
    Args:
        text: String a parsear
        
    Returns:
        float normalizado o None si no se encuentra
        
    Raises:
        ValueError: Si el formato es inválido
    """
```

## Performance

- Backend: Response time < 200ms (sin BD)
- Frontend: First Contentful Paint < 2s
- NLP: Parse SMS < 100ms en promedio
- Mantener bundle sizes < 150KB gzipped

## Seguridad

**No commitear:**
- Contraseñas o API keys
- Tokens de autenticación
- Información sensible

**Usar:**
- `.env.example` para variables
- Secrets en CI/CD
- `.gitignore` para archivos locales

## Merge Requirements

Antes de mergear:
- [ ] Tests pasan (CI/CD)
- [ ] Linters pasan
- [ ] Code review aprobado
- [ ] 0 security warnings
- [ ] Documentación actualizada
- [ ] CHANGELOG.md actualizado

## Preguntas Frecuentes

**¿Puedo contribuir con mi primer PR?**
Sí, estaremos felices de ayudarte. Empieza con issues marcadas como `good-first-issue`.

**¿Cuánto tiempo tarda el review?**
Típicamente 24-48 horas. Los PRs grandes pueden tomar más.

**¿Cómo reporto una vulnerabilidad de seguridad?**
NO abrir issue pública. Enviar email a security@finzapp.co.

**¿Puedo proponer grandes cambios?**
Sí, pero abre una issue primero para discutir el approach.

## Recursos

- [Sitio web](https://finzapp.co)
- [Documentación](https://docs.finzapp.co)
- [Discord Community](https://discord.gg/finzapp)

---

¡Gracias por contribuir! 🎉
