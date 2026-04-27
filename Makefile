.PHONY: help dev prod down logs test migrate seed nlp-test clean

# Variables
DOCKER_COMPOSE_DEV := docker-compose -f docker-compose.yml -f docker-compose.dev.yml
DOCKER_COMPOSE_PROD := docker-compose -f docker-compose.yml

help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-15s\033[0m %s\n", $$1, $$2}'

# ============================================================================
# Docker Compose Management
# ============================================================================

dev: ## Levanta los servicios en modo desarrollo con hot-reload
	@echo "Starting FinzApp in development mode..."
	$(DOCKER_COMPOSE_DEV) up -d
	@echo "Services are starting..."
	@sleep 10
	@make logs

prod: ## Levanta los servicios en modo producción
	@echo "Starting FinzApp in production mode..."
	@cp .env.example .env
	$(DOCKER_COMPOSE_PROD) up -d
	@echo "Services are starting..."
	@sleep 10
	@make logs

down: ## Detiene y elimina todos los contenedores
	@echo "Stopping all services..."
	$(DOCKER_COMPOSE_DEV) down -v
	@echo "All services stopped"

restart: ## Reinicia todos los servicios
	@echo "Restarting services..."
	make down
	make dev

logs: ## Muestra los logs de todos los servicios (-f para follow)
	$(DOCKER_COMPOSE_DEV) logs -f

logs-api: ## Muestra los logs del backend
	$(DOCKER_COMPOSE_DEV) logs -f api

logs-frontend: ## Muestra los logs del frontend
	$(DOCKER_COMPOSE_DEV) logs -f frontend

logs-nlp: ## Muestra los logs del servicio NLP
	$(DOCKER_COMPOSE_DEV) logs -f nlp-service

logs-db: ## Muestra los logs de la base de datos
	$(DOCKER_COMPOSE_DEV) logs -f db

logs-redis: ## Muestra los logs de Redis
	$(DOCKER_COMPOSE_DEV) logs -f redis

status: ## Muestra el estado de todos los servicios
	@$(DOCKER_COMPOSE_DEV) ps

# ============================================================================
# Database Management
# ============================================================================

migrate: ## Ejecuta migraciones de Prisma
	@echo "Running database migrations..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run prisma:migrate:dev
	@echo "Migrations completed"

seed: ## Ejecuta seed de datos iniciales
	@echo "Seeding database..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run prisma:seed
	@echo "Seed completed"

db-reset: ## Resetea la base de datos completamente
	@echo "Resetting database..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run prisma:reset
	@echo "Database reset completed"

db-shell: ## Accede a la consola de PostgreSQL
	$(DOCKER_COMPOSE_DEV) exec db psql -U ${POSTGRES_USER} -d ${POSTGRES_DB}

# ============================================================================
# Testing
# ============================================================================

test: ## Ejecuta todos los tests (backend + frontend + nlp)
	@echo "Running all tests..."
	make backend-test
	make frontend-test
	make nlp-test

backend-test: ## Ejecuta tests del backend
	@echo "Testing backend..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run test

backend-test-watch: ## Ejecuta tests del backend en modo watch
	@echo "Testing backend (watch mode)..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run test:watch

backend-test-coverage: ## Ejecuta tests del backend con cobertura
	@echo "Testing backend (with coverage)..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run test:coverage

frontend-test: ## Ejecuta tests del frontend
	@echo "Testing frontend..."
	$(DOCKER_COMPOSE_DEV) exec -T frontend npm run test

frontend-test-coverage: ## Ejecuta tests del frontend con cobertura
	@echo "Testing frontend (with coverage)..."
	$(DOCKER_COMPOSE_DEV) exec -T frontend npm run test:coverage

nlp-test: ## Ejecuta tests del servicio NLP
	@echo "Testing NLP service..."
	$(DOCKER_COMPOSE_DEV) exec -T nlp-service pytest -v --tb=short
	@echo "NLP tests completed"

nlp-test-coverage: ## Ejecuta tests del NLP con cobertura
	@echo "Testing NLP service (with coverage)..."
	$(DOCKER_COMPOSE_DEV) exec -T nlp-service pytest -v --cov=parser --cov-report=term-missing

lint: ## Ejecuta linters en todos los servicios
	@echo "Linting all services..."
	make backend-lint
	make frontend-lint
	make nlp-lint

backend-lint: ## Ejecuta linter del backend
	@echo "Linting backend..."
	$(DOCKER_COMPOSE_DEV) exec -T api npm run lint

frontend-lint: ## Ejecuta linter del frontend
	@echo "Linting frontend..."
	$(DOCKER_COMPOSE_DEV) exec -T frontend npm run lint

nlp-lint: ## Ejecuta linter del NLP
	@echo "Linting NLP service..."
	$(DOCKER_COMPOSE_DEV) exec -T nlp-service pylint parser/ || true

# ============================================================================
# Development Tools
# ============================================================================

shell-api: ## Accede a la shell del contenedor del backend
	$(DOCKER_COMPOSE_DEV) exec api /bin/bash

shell-frontend: ## Accede a la shell del contenedor del frontend
	$(DOCKER_COMPOSE_DEV) exec frontend /bin/bash

shell-nlp: ## Accede a la shell del contenedor del NLP
	$(DOCKER_COMPOSE_DEV) exec nlp-service /bin/bash

build: ## Construye todas las imágenes Docker
	@echo "Building Docker images..."
	$(DOCKER_COMPOSE_DEV) build

rebuild: ## Reconstruye todas las imágenes Docker sin cache
	@echo "Rebuilding Docker images (no cache)..."
	$(DOCKER_COMPOSE_DEV) build --no-cache

# ============================================================================
# Utilities
# ============================================================================

clean: ## Limpia contenedores, volúmenes e imágenes no utilizadas
	@echo "Cleaning up Docker resources..."
	docker system prune -f
	@echo "Cleanup completed"

ps: ## Lista todos los contenedores
	@docker ps -a

health: ## Comprueba la salud de los servicios
	@echo "Checking service health..."
	@curl -s http://localhost:3000/api/v1/health | jq '.' || echo "API: No response"
	@curl -s http://localhost:8001/health | jq '.' || echo "NLP: No response"
	@curl -s http://localhost/ || echo "Frontend: No response"

# ============================================================================
# Common Tasks
# ============================================================================

fresh: ## Limpia todo y levanta los servicios desde cero
	@echo "Fresh start..."
	make down
	make clean
	make dev
	@sleep 20
	make migrate
	make seed

install-git-hooks: ## Instala git hooks para pre-commit checks
	@echo "Installing git hooks..."
	cp scripts/pre-commit .git/hooks/pre-commit
	chmod +x .git/hooks/pre-commit
	@echo "Git hooks installed"

# ============================================================================
# Production
# ============================================================================

prod-build: ## Construye imágenes para producción
	@echo "Building production images..."
	docker build -t finzapp-api:latest ./backend
	docker build -t finzapp-frontend:latest ./frontend
	docker build -t finzapp-nlp:latest ./nlp-service
	@echo "Production images built"

prod-test: ## Ejecuta tests antes de deploy en producción
	@echo "Running production tests..."
	make lint
	make test
	@echo "All tests passed!"
