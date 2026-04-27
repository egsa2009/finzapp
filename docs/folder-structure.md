# FinzApp - Estructura de Carpetas Completa

**Versión:** 1.0  
**Fecha:** Abril 2026  
**Autores:** Equipo FinzApp  

## 1. Árbol General del Proyecto

```
finzapp/
├── README.md
├── LICENSE (MIT)
├── .gitignore
├── .env.example
│
├── backend/                          # NestJS Backend
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── nest-cli.json
│   ├── .eslintrc.js
│   ├── .prettierrc
│   ├── .dockerignore
│   ├── Dockerfile
│   ├── docker-compose.yml
│   │
│   ├── src/
│   │   ├── main.ts                  # Entry point
│   │   ├── app.module.ts            # Root module
│   │   │
│   │   ├── domain/                  # Entidades y DTOs (Clean Architecture)
│   │   │   ├── entities/
│   │   │   │   ├── user.entity.ts
│   │   │   │   ├── transaction.entity.ts
│   │   │   │   ├── category.entity.ts
│   │   │   │   ├── budget.entity.ts
│   │   │   │   ├── notification.entity.ts
│   │   │   │   ├── audit-log.entity.ts
│   │   │   │   └── refresh-token.entity.ts
│   │   │   │
│   │   │   └── dtos/
│   │   │       ├── auth/
│   │   │       │   ├── login.dto.ts
│   │   │       │   ├── register.dto.ts
│   │   │       │   ├── refresh-token.dto.ts
│   │   │       │   └── auth-response.dto.ts
│   │   │       ├── transaction/
│   │   │       │   ├── create-transaction.dto.ts
│   │   │       │   ├── update-transaction.dto.ts
│   │   │       │   ├── transaction-response.dto.ts
│   │   │       │   └── transaction-filter.dto.ts
│   │   │       ├── user/
│   │   │       │   ├── create-user.dto.ts
│   │   │       │   ├── update-profile.dto.ts
│   │   │       │   └── user-response.dto.ts
│   │   │       └── common/
│   │   │           ├── pagination.dto.ts
│   │   │           └── response.dto.ts
│   │   │
│   │   ├── application/             # Casos de uso (Services)
│   │   │   ├── auth/
│   │   │   │   ├── auth.service.ts
│   │   │   │   ├── jwt.service.ts
│   │   │   │   ├── password.service.ts
│   │   │   │   └── auth.service.spec.ts
│   │   │   ├── transaction/
│   │   │   │   ├── transaction.service.ts
│   │   │   │   ├── category.service.ts
│   │   │   │   ├── transaction-filter.service.ts
│   │   │   │   └── transaction.service.spec.ts
│   │   │   ├── user/
│   │   │   │   ├── user.service.ts
│   │   │   │   ├── profile.service.ts
│   │   │   │   └── user.service.spec.ts
│   │   │   ├── notification/
│   │   │   │   ├── notification.service.ts
│   │   │   │   ├── email.service.ts
│   │   │   │   ├── push.service.ts
│   │   │   │   └── notification.service.spec.ts
│   │   │   ├── webhook/
│   │   │   │   ├── webhook.service.ts
│   │   │   │   ├── sms-parser.service.ts
│   │   │   │   └── webhook.service.spec.ts
│   │   │   └── analytics/
│   │   │       ├── analytics.service.ts
│   │   │       ├── dashboard.service.ts
│   │   │       ├── reports.service.ts
│   │   │       └── analytics.service.spec.ts
│   │   │
│   │   ├── infrastructure/          # BD, APIs externas, I/O
│   │   │   ├── database/
│   │   │   │   ├── typeorm.config.ts
│   │   │   │   ├── migrations/
│   │   │   │   │   ├── 1703001000000-CreateUsersTable.ts
│   │   │   │   │   ├── 1703001100000-CreateTransactionsTable.ts
│   │   │   │   │   └── ...
│   │   │   │   └── seeds/
│   │   │   │       └── seed.ts
│   │   │   ├── repositories/
│   │   │   │   ├── user.repository.ts
│   │   │   │   ├── transaction.repository.ts
│   │   │   │   ├── category.repository.ts
│   │   │   │   ├── budget.repository.ts
│   │   │   │   └── ...
│   │   │   ├── redis/
│   │   │   │   ├── redis.module.ts
│   │   │   │   ├── redis.service.ts
│   │   │   │   └── cache.service.ts
│   │   │   ├── queue/
│   │   │   │   ├── bull.module.ts
│   │   │   │   ├── transaction-queue.processor.ts
│   │   │   │   ├── nlp-queue.processor.ts
│   │   │   │   └── queue.service.ts
│   │   │   ├── external/
│   │   │   │   ├── firebase.service.ts
│   │   │   │   ├── twilio.service.ts (SMS)
│   │   │   │   ├── sendgrid.service.ts (Email)
│   │   │   │   └── nlp-client.service.ts
│   │   │   └── logger/
│   │   │       ├── logger.module.ts
│   │   │       ├── winston.logger.ts
│   │   │       └── audit.logger.ts
│   │   │
│   │   ├── presentation/            # Controllers y Validadores
│   │   │   ├── auth/
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.module.ts
│   │   │   │   └── auth.validator.ts
│   │   │   ├── transaction/
│   │   │   │   ├── transaction.controller.ts
│   │   │   │   ├── transaction.module.ts
│   │   │   │   └── transaction.validator.ts
│   │   │   ├── user/
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.module.ts
│   │   │   │   └── user.validator.ts
│   │   │   ├── webhook/
│   │   │   │   ├── webhook.controller.ts
│   │   │   │   ├── webhook.module.ts
│   │   │   │   └── webhook.validator.ts
│   │   │   ├── analytics/
│   │   │   │   ├── analytics.controller.ts
│   │   │   │   ├── analytics.module.ts
│   │   │   │   └── analytics.validator.ts
│   │   │   └── notification/
│   │   │       ├── notification.controller.ts
│   │   │       ├── notification.module.ts
│   │   │       └── notification.validator.ts
│   │   │
│   │   ├── common/                  # Helpers, Guards, Interceptors
│   │   │   ├── decorators/
│   │   │   │   ├── auth.decorator.ts
│   │   │   │   ├── rate-limit.decorator.ts
│   │   │   │   ├── validate.decorator.ts
│   │   │   │   └── roles.decorator.ts
│   │   │   ├── guards/
│   │   │   │   ├── jwt.guard.ts
│   │   │   │   ├── roles.guard.ts
│   │   │   │   └── rate-limit.guard.ts
│   │   │   ├── interceptors/
│   │   │   │   ├── logging.interceptor.ts
│   │   │   │   ├── transform.interceptor.ts
│   │   │   │   ├── error.interceptor.ts
│   │   │   │   └── timeout.interceptor.ts
│   │   │   ├── pipes/
│   │   │   │   ├── validation.pipe.ts
│   │   │   │   └── parse-int.pipe.ts
│   │   │   ├── filters/
│   │   │   │   └── exception.filter.ts
│   │   │   ├── utils/
│   │   │   │   ├── crypto.util.ts
│   │   │   │   ├── date.util.ts
│   │   │   │   ├── validator.util.ts
│   │   │   │   └── pagination.util.ts
│   │   │   ├── constants/
│   │   │   │   ├── bank-patterns.const.ts
│   │   │   │   ├── error-messages.const.ts
│   │   │   │   ├── http-status.const.ts
│   │   │   │   └── app.const.ts
│   │   │   └── enums/
│   │   │       ├── transaction-type.enum.ts
│   │   │       ├── user-role.enum.ts
│   │   │       ├── notification-type.enum.ts
│   │   │       └── transaction-status.enum.ts
│   │   │
│   │   └── config/                  # Configuración
│   │       ├── app.config.ts
│   │       ├── database.config.ts
│   │       ├── redis.config.ts
│   │       ├── jwt.config.ts
│   │       ├── firebase.config.ts
│   │       └── swagger.config.ts
│   │
│   ├── test/
│   │   ├── app.e2e-spec.ts
│   │   ├── auth.e2e-spec.ts
│   │   ├── transaction.e2e-spec.ts
│   │   └── jest-e2e.json
│   │
│   └── scripts/
│       ├── seed.ts
│       ├── migrate.ts
│       └── health-check.ts
│
├── frontend/                        # React 18 + Vite PWA
│   ├── package.json
│   ├── package-lock.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── .eslintrc.cjs
│   ├── .prettierrc
│   ├── vitest.config.ts
│   ├── index.html
│   ├── manifest.json               # PWA Manifest
│   ├── .env.example
│   │
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── favicon-192.png
│   │   ├── favicon-512.png
│   │   ├── apple-touch-icon.png
│   │   └── robots.txt
│   │
│   ├── src/
│   │   ├── main.tsx                # Entry point
│   │   ├── App.tsx                 # Root component
│   │   ├── index.css               # Global styles
│   │   ├── vite-env.d.ts
│   │   │
│   │   ├── pages/
│   │   │   ├── Login.tsx
│   │   │   ├── Register.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── Transactions.tsx
│   │   │   ├── Categories.tsx
│   │   │   ├── Budgets.tsx
│   │   │   ├── Analytics.tsx
│   │   │   ├── Reports.tsx
│   │   │   ├── Settings.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── NotFound.tsx
│   │   │
│   │   ├── components/
│   │   │   ├── common/
│   │   │   │   ├── Header.tsx
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Footer.tsx
│   │   │   │   ├── Loading.tsx
│   │   │   │   ├── ErrorBoundary.tsx
│   │   │   │   └── Modal.tsx
│   │   │   ├── auth/
│   │   │   │   ├── LoginForm.tsx
│   │   │   │   ├── RegisterForm.tsx
│   │   │   │   ├── ProtectedRoute.tsx
│   │   │   │   └── TwoFactorForm.tsx
│   │   │   ├── transaction/
│   │   │   │   ├── TransactionList.tsx
│   │   │   │   ├── TransactionCard.tsx
│   │   │   │   ├── TransactionForm.tsx
│   │   │   │   ├── TransactionFilter.tsx
│   │   │   │   ├── TransactionDetail.tsx
│   │   │   │   └── BulkActions.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── BalanceCard.tsx
│   │   │   │   ├── ExpensesChart.tsx
│   │   │   │   ├── IncomeChart.tsx
│   │   │   │   ├── CategoryBreakdown.tsx
│   │   │   │   ├── RecentTransactions.tsx
│   │   │   │   └── QuickStats.tsx
│   │   │   ├── analytics/
│   │   │   │   ├── AnalyticsChart.tsx
│   │   │   │   ├── AnomalyAlert.tsx
│   │   │   │   ├── TrendAnalysis.tsx
│   │   │   │   └── ExportButton.tsx
│   │   │   ├── budget/
│   │   │   │   ├── BudgetForm.tsx
│   │   │   │   ├── BudgetCard.tsx
│   │   │   │   ├── BudgetProgress.tsx
│   │   │   │   └── BudgetAlert.tsx
│   │   │   └── settings/
│   │   │       ├── PreferencesForm.tsx
│   │   │       ├── NotificationSettings.tsx
│   │   │       ├── SecuritySettings.tsx
│   │   │       ├── AccountSettings.tsx
│   │   │       └── DataManagement.tsx
│   │   │
│   │   ├── hooks/
│   │   │   ├── useAuth.ts
│   │   │   ├── useTransaction.ts
│   │   │   ├── useAnalytics.ts
│   │   │   ├── usePagination.ts
│   │   │   ├── useLocalStorage.ts
│   │   │   ├── useNotification.ts
│   │   │   ├── useDebounce.ts
│   │   │   └── useFetch.ts
│   │   │
│   │   ├── store/                  # Redux Store
│   │   │   ├── store.ts
│   │   │   ├── slices/
│   │   │   │   ├── authSlice.ts
│   │   │   │   ├── transactionSlice.ts
│   │   │   │   ├── uiSlice.ts
│   │   │   │   ├── userSlice.ts
│   │   │   │   └── notificationSlice.ts
│   │   │   └── middleware/
│   │   │       ├── authMiddleware.ts
│   │   │       └── persistMiddleware.ts
│   │   │
│   │   ├── api/
│   │   │   ├── client.ts            # Axios client
│   │   │   ├── auth.api.ts
│   │   │   ├── transaction.api.ts
│   │   │   ├── user.api.ts
│   │   │   ├── analytics.api.ts
│   │   │   └── interceptors.ts
│   │   │
│   │   ├── services/
│   │   │   ├── storage.service.ts
│   │   │   ├── notification.service.ts
│   │   │   ├── sync.service.ts
│   │   │   └── offline.service.ts
│   │   │
│   │   ├── utils/
│   │   │   ├── validators.ts
│   │   │   ├── formatters.ts
│   │   │   ├── date.util.ts
│   │   │   ├── currency.util.ts
│   │   │   ├── storage.util.ts
│   │   │   └── crypto.util.ts
│   │   │
│   │   ├── types/
│   │   │   ├── api.types.ts
│   │   │   ├── transaction.types.ts
│   │   │   ├── user.types.ts
│   │   │   ├── auth.types.ts
│   │   │   └── common.types.ts
│   │   │
│   │   ├── styles/
│   │   │   ├── tailwind.config.ts
│   │   │   ├── globals.css
│   │   │   ├── components.css
│   │   │   └── variables.css
│   │   │
│   │   ├── service-worker.ts        # PWA Service Worker
│   │   └── register-sw.ts
│   │
│   └── tests/
│       ├── unit/
│       │   ├── utils.test.ts
│       │   ├── hooks.test.ts
│       │   └── components.test.tsx
│       ├── integration/
│       │   ├── auth.integration.test.ts
│       │   └── transaction.integration.test.ts
│       └── e2e/
│           ├── login.e2e.ts
│           └── dashboard.e2e.ts
│
├── nlp-service/                    # Python NLP Service
│   ├── requirements.txt
│   ├── setup.py
│   ├── Dockerfile
│   ├── docker-compose.yml
│   ├── .env.example
│   │
│   ├── src/
│   │   ├── main.py                 # Entry point (FastAPI)
│   │   ├── __init__.py
│   │   │
│   │   ├── models/
│   │   │   ├── __init__.py
│   │   │   ├── transaction.model.py
│   │   │   ├── bank-entities.model.py
│   │   │   └── nlp.model.py
│   │   │
│   │   ├── services/
│   │   │   ├── __init__.py
│   │   │   ├── sms-parser.service.py
│   │   │   ├── nlp-engine.service.py
│   │   │   ├── entity-extractor.service.py
│   │   │   └── feedback-trainer.service.py
│   │   │
│   │   ├── patterns/
│   │   │   ├── __init__.py
│   │   │   ├── bancolombia.patterns.py
│   │   │   ├── davivienda.patterns.py
│   │   │   ├── nequi.patterns.py
│   │   │   ├── daviplata.patterns.py
│   │   │   ├── bbva.patterns.py
│   │   │   ├── scotiabank.patterns.py
│   │   │   └── generic.patterns.py
│   │   │
│   │   ├── utils/
│   │   │   ├── __init__.py
│   │   │   ├── text-cleaner.py
│   │   │   ├── validators.py
│   │   │   ├── logger.py
│   │   │   └── config.py
│   │   │
│   │   ├── api/
│   │   │   ├── __init__.py
│   │   │   ├── routes.py
│   │   │   ├── schemas.py
│   │   │   └── middleware.py
│   │   │
│   │   ├── ml/
│   │   │   ├── __init__.py
│   │   │   ├── spacy-pipeline.py
│   │   │   ├── transformer-models.py
│   │   │   ├── training-data/
│   │   │   │   ├── bancolombia.training.json
│   │   │   │   ├── davivienda.training.json
│   │   │   │   ├── nequi.training.json
│   │   │   │   └── feedback-corpus.json
│   │   │   └── models/ (no versionados, descargados en build)
│   │   │       ├── es_core_news_md/
│   │   │       └── custom-models/
│   │   │
│   │   ├── queue/
│   │   │   ├── __init__.py
│   │   │   ├── celery-worker.py
│   │   │   └── tasks.py
│   │   │
│   │   └── config/
│   │       ├── __init__.py
│   │       ├── settings.py
│   │       └── logging.config.py
│   │
│   ├── tests/
│   │   ├── __init__.py
│   │   ├── test_parser.py
│   │   ├── test_entity-extractor.py
│   │   ├── test_pattern-matching.py
│   │   └── fixtures/
│   │       ├── bancolombia.sms.json
│   │       ├── davivienda.sms.json
│   │       └── nequi.sms.json
│   │
│   └── scripts/
│       ├── train-custom-model.py
│       ├── evaluate-parser.py
│       └── export-models.py
│
├── companion-apps/                 # Apps nativas iOS/Android
│   │
│   ├── ios/
│   │   ├── FinzApp.xcodeproj
│   │   ├── FinzApp.xcworkspace
│   │   ├── Podfile
│   │   │
│   │   ├── FinzApp/
│   │   │   ├── App/
│   │   │   │   ├── FinzAppApp.swift
│   │   │   │   └── ContentView.swift
│   │   │   ├── Models/
│   │   │   │   ├── Transaction.swift
│   │   │   │   ├── User.swift
│   │   │   │   └── API.swift
│   │   │   ├── Services/
│   │   │   │   ├── NotificationHandler.swift
│   │   │   │   ├── SMSParser.swift
│   │   │   │   ├── APIClient.swift
│   │   │   │   ├── AuthService.swift
│   │   │   │   └── SyncService.swift
│   │   │   ├── Views/
│   │   │   │   ├── HomeView.swift
│   │   │   │   ├── LoginView.swift
│   │   │   │   ├── PermissionRequestView.swift
│   │   │   │   ├── TransactionListView.swift
│   │   │   │   └── SettingsView.swift
│   │   │   ├── Shortcuts/
│   │   │   │   └── CaptureTransaction.shortcut
│   │   │   └── Resources/
│   │   │       ├── Assets.xcassets
│   │   │       └── Localizable.strings
│   │   │
│   │   └── FinzAppTests/
│   │       ├── APIClientTests.swift
│   │       └── SMSParserTests.swift
│   │
│   └── android/
│       ├── build.gradle.kts (project)
│       ├── settings.gradle.kts
│       │
│       ├── app/
│       │   ├── build.gradle.kts
│       │   ├── src/
│       │   │   ├── main/
│       │   │   │   ├── AndroidManifest.xml
│       │   │   │   ├── kotlin/com/finzapp/
│       │   │   │   │   ├── MainActivity.kt
│       │   │   │   │   ├── LoginActivity.kt
│       │   │   │   │   │
│       │   │   │   │   ├── models/
│       │   │   │   │   │   ├── Transaction.kt
│       │   │   │   │   │   ├── User.kt
│       │   │   │   │   │   └── AuthResponse.kt
│       │   │   │   │   │
│       │   │   │   │   ├── services/
│       │   │   │   │   │   ├── SMSReceiver.kt
│       │   │   │   │   │   ├── SMSParser.kt
│       │   │   │   │   │   ├── APIClient.kt
│       │   │   │   │   │   ├── AuthService.kt
│       │   │   │   │   │   ├── SyncService.kt
│       │   │   │   │   │   ├── NotificationService.kt
│       │   │   │   │   │   └── WorkManager.kt
│       │   │   │   │   │
│       │   │   │   │   ├── ui/
│       │   │   │   │   │   ├── screens/
│       │   │   │   │   │   │   ├── LoginScreen.kt
│       │   │   │   │   │   │   ├── HomeScreen.kt
│       │   │   │   │   │   │   ├── TransactionListScreen.kt
│       │   │   │   │   │   │   ├── SettingsScreen.kt
│       │   │   │   │   │   │   └── PermissionScreen.kt
│       │   │   │   │   │   ├── components/
│       │   │   │   │   │   │   ├── TransactionCard.kt
│       │   │   │   │   │   │   └── LoadingIndicator.kt
│       │   │   │   │   │   └── theme/
│       │   │   │   │   │       ├── Color.kt
│       │   │   │   │   │       ├── Typography.kt
│       │   │   │   │   │       └── Theme.kt
│       │   │   │   │   │
│       │   │   │   │   ├── data/
│       │   │   │   │   │   ├── db/
│       │   │   │   │   │   │   ├── AppDatabase.kt
│       │   │   │   │   │   │   ├── entities/
│       │   │   │   │   │   │   │   ├── TransactionEntity.kt
│       │   │   │   │   │   │   │   └── UserEntity.kt
│       │   │   │   │   │   │   └── dao/
│       │   │   │   │   │   │       ├── TransactionDao.kt
│       │   │   │   │   │   │       └── UserDao.kt
│       │   │   │   │   │   ├── api/
│       │   │   │   │   │   │   ├── ApiService.kt
│       │   │   │   │   │   │   └── interceptors/
│       │   │   │   │   │   │       └── AuthInterceptor.kt
│       │   │   │   │   │   ├── repository/
│       │   │   │   │   │   │   ├── TransactionRepository.kt
│       │   │   │   │   │   │   └── UserRepository.kt
│       │   │   │   │   │   └── preferences/
│       │   │   │   │   │       └── AppPreferences.kt
│       │   │   │   │   │
│       │   │   │   │   ├── viewmodel/
│       │   │   │   │   │   ├── AuthViewModel.kt
│       │   │   │   │   │   ├── TransactionViewModel.kt
│       │   │   │   │   │   └── HomeViewModel.kt
│       │   │   │   │   │
│       │   │   │   │   └── di/
│       │   │   │   │       └── AppModule.kt (Hilt)
│       │   │   │   │
│       │   │   │   └── res/
│       │   │   │       ├── layout/
│       │   │   │       ├── drawable/
│       │   │   │       ├── values/
│       │   │   │       └── mipmap/
│       │   │   │
│       │   │   └── test/
│       │   │       ├── kotlin/com/finzapp/
│       │   │       │   ├── SMSParserTest.kt
│       │   │       │   └── APIClientTest.kt
│       │   │       └── resources/
│       │   │
│       │   └── build/ (generado)
│       │
│       └── gradle/
│           └── wrapper/
│
├── devops/                         # DevOps y Configuración
│   │
│   ├── docker/
│   │   ├── backend.Dockerfile
│   │   ├── frontend.Dockerfile
│   │   ├── nlp-service.Dockerfile
│   │   └── docker-compose.prod.yml
│   │
│   ├── kubernetes/
│   │   ├── namespace.yaml
│   │   ├── backend-deployment.yaml
│   │   ├── frontend-deployment.yaml
│   │   ├── nlp-service-deployment.yaml
│   │   ├── postgresql-statefulset.yaml
│   │   ├── redis-statefulset.yaml
│   │   ├── service.yaml
│   │   ├── ingress.yaml
│   │   ├── configmap.yaml
│   │   ├── secret.yaml
│   │   └── autoscaling-hpa.yaml
│   │
│   ├── helm/
│   │   └── finzapp-chart/
│   │       ├── Chart.yaml
│   │       ├── values.yaml
│   │       ├── templates/
│   │       │   ├── backend-deployment.yaml
│   │       │   ├── frontend-deployment.yaml
│   │       │   ├── database-statefulset.yaml
│   │       │   ├── redis-statefulset.yaml
│   │       │   └── ingress.yaml
│   │       └── values-prod.yaml
│   │
│   ├── terraform/
│   │   ├── main.tf
│   │   ├── variables.tf
│   │   ├── outputs.tf
│   │   ├── vpc.tf
│   │   ├── database.tf
│   │   ├── compute.tf
│   │   ├── security-groups.tf
│   │   └── environments/
│   │       ├── dev.tfvars
│   │       ├── staging.tfvars
│   │       └── prod.tfvars
│   │
│   ├── github-actions/
│   │   └── .github/workflows/
│   │       ├── backend-ci.yml
│   │       ├── frontend-ci.yml
│   │       ├── nlp-ci.yml
│   │       ├── security-scan.yml
│   │       ├── deploy-staging.yml
│   │       └── deploy-production.yml
│   │
│   ├── monitoring/
│   │   ├── prometheus-config.yaml
│   │   ├── grafana-dashboards.json
│   │   ├── alerts.yaml
│   │   └── elk-stack/
│   │       ├── elasticsearch.yml
│   │       ├── kibana.yml
│   │       └── filebeat.yml
│   │
│   ├── nginx/
│   │   ├── nginx.conf
│   │   ├── upstream.conf
│   │   └── ssl.conf
│   │
│   └── scripts/
│       ├── deploy.sh
│       ├── rollback.sh
│       ├── health-check.sh
│       ├── backup-db.sh
│       └── cleanup.sh
│
├── docs/                           # Documentación
│   ├── README.md
│   ├── CONTRIBUTING.md
│   ├── CHANGELOG.md
│   ├── architecture-overview.md    # Este archivo
│   ├── folder-structure.md         # Este archivo
│   ├── coding-standards.md
│   ├── API.md
│   ├── DEPLOYMENT.md
│   │
│   ├── guides/
│   │   ├── getting-started.md
│   │   ├── local-setup.md
│   │   ├── database-migrations.md
│   │   ├── testing-guide.md
│   │   ├── debugging.md
│   │   └── contribution-workflow.md
│   │
│   ├── adr/
│   │   ├── ADR-001-clean-architecture.md
│   │   ├── ADR-002-stack-selection.md
│   │   ├── ADR-003-sms-notification-capture.md
│   │   ├── ADR-004-nlp-parser.md
│   │   └── ADR-README.md
│   │
│   ├── tutorials/
│   │   ├── first-transaction.md
│   │   ├── adding-new-bank.md
│   │   ├── training-nlp-model.md
│   │   └── customizing-dashboard.md
│   │
│   └── api-docs/ (generado con Swagger)
│       ├── openapi.json
│       └── swagger-ui.html
│
├── scripts/
│   ├── setup-local.sh
│   ├── start-all.sh
│   ├── stop-all.sh
│   ├── test-all.sh
│   ├── lint-all.sh
│   ├── format-all.sh
│   ├── db-migrate.sh
│   ├── seed-db.sh
│   └── clean.sh
│
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   ├── feature_request.md
│   │   └── documentation.md
│   │
│   ├── PULL_REQUEST_TEMPLATE.md
│   │
│   └── workflows/
│       ├── backend-ci.yml
│       ├── frontend-ci.yml
│       └── deploy.yml
│
├── .env.example
├── .gitignore
├── .dockerignore
├── docker-compose.yml              # Local development
├── package.json                    # Root monorepo
├── tsconfig.base.json
├── .eslintrc.json
├── .prettierrc
├── turbo.json (si usa Turborepo)
├── pnpm-workspace.yaml (si usa pnpm)
│
├── README.md
├── CHANGELOG.md
├── LICENSE
└── .editorconfig
```

## 2. Descripción de Archivos Clave

### Backend Core
- `src/main.ts` - Bootstrap de NestJS
- `src/app.module.ts` - Módulo raíz que importa todos los módulos
- `src/domain/` - Entidades del dominio (independientes de framework)
- `src/application/` - Servicios (casos de uso)
- `src/infrastructure/` - Implementaciones concretas (BD, APIs)
- `src/presentation/` - Controllers (entrada HTTP)

### Frontend Core
- `src/main.tsx` - Entry point React
- `src/App.tsx` - Componente raíz
- `src/store/` - Redux store centralizado
- `src/api/` - Cliente HTTP (Axios)
- `src/service-worker.ts` - PWA service worker para offline
- `manifest.json` - Metadata PWA

### NLP Service
- `src/main.py` - FastAPI application
- `src/patterns/` - Regex patterns específicos por banco
- `src/services/sms-parser.service.py` - Parse de SMS
- `src/ml/` - Modelos spaCy y transformers

### Companion Apps
- `ios/FinzApp/` - Proyecto Xcode con SwiftUI
- `android/app/src/main/kotlin/` - Proyecto Android con Kotlin

### DevOps
- `docker-compose.yml` - Orquestación local con contenedores
- `kubernetes/` - Manifiestos K8s para producción
- `terraform/` - Infraestructura como código (AWS/GCP)
- `.github/workflows/` - CI/CD con GitHub Actions

## 3. Archivos de Configuración Importantes

| Archivo | Propósito |
|---------|-----------|
| `backend/tsconfig.json` | Configuración TypeScript |
| `backend/.eslintrc.js` | Linting rules |
| `backend/.prettierrc` | Formato de código |
| `frontend/vite.config.ts` | Build config Vite |
| `frontend/tailwind.config.ts` | Tema TailwindCSS |
| `.env.example` | Variables de entorno (template) |
| `docker-compose.yml` | Compose para desarrollo local |
| `kubernetes/secret.yaml` | Secretos (base64 encoded) |

## 4. Directorios a Generar (No versionados)

```
node_modules/          # npm dependencies
dist/                  # Compilado JavaScript
build/                 # Build artifacts frontend
.next/                 # Next.js cache (si aplica)
.pytest_cache/         # Python cache
__pycache__/           # Python bytecode
venv/                  # Virtual env Python
.env                   # Env variables reales
coverage/              # Test coverage reports
.idea/                 # IDE cache (JetBrains)
```

---

**Notas:**
- Usar un monorepo tool como Turborepo o Yarn workspaces para gestionar múltiples paquetes
- Todos los paths relativos son desde root del proyecto
- Documentación siempre actualizada con código
