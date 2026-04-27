# Guía de Deployment - FinzApp

## Ambientes

FinzApp está diseñado para deployarse en tres ambientes:

1. **Development** - Máquina local con hot-reload
2. **Staging** - Servidor de pruebas antes de producción
3. **Production** - Servidor en vivo

## Requisitos Previos

- Docker 24+ y Docker Compose
- Domain y certificado SSL (producción)
- Variables de entorno configuradas
- Backup de base de datos (producción)

## Development (Local)

```bash
# 1. Clonar repositorio
git clone https://github.com/your-org/finzapp.git
cd finzapp

# 2. Copiar variables de entorno
cp .env.example .env

# 3. Levantar servicios
make dev

# 4. Frontend en http://localhost:5173
# 5. API en http://localhost:3000
# 6. NLP en http://localhost:8001
```

Cambios en código automáticamente hot-reload.

## Staging (Servidor de Testing)

```bash
# 1. SSH al servidor staging
ssh user@staging.finzapp.co

# 2. Clonar repositorio
git clone https://github.com/your-org/finzapp.git /var/www/finzapp
cd /var/www/finzapp

# 3. Crear .env desde template
cp .env.example .env

# 4. Configurar variables
nano .env
# - Cambiar DATABASE_URL a BD real
# - Cambiar REDIS_URL a Redis real
# - Generar JWT_SECRET nuevo
# - Cambiar INGEST_API_KEY

# 5. Limpiar volúmenes previos (si existe)
docker-compose down -v

# 6. Build y deploy
docker-compose build
docker-compose up -d

# 7. Ejecutar migraciones
docker-compose exec api npm run prisma:migrate:deploy
docker-compose exec api npm run prisma:seed

# 8. Verificar salud
curl http://localhost:3000/api/v1/health
curl http://localhost:8001/health

# 9. Ver logs
docker-compose logs -f
```

## Production (Servidor en Vivo)

### Pre-requisitos de Seguridad

```bash
# 1. SSH keys (no password)
ssh-keygen -t rsa -b 4096 -f finzapp-deploy

# 2. Nginx reverse proxy
# 3. Certificado SSL (Let's Encrypt)
# 4. Firewall: Solo puertos 80, 443
# 5. Backup automático de BD
# 6. Monitoring y alertas
```

### Setup Inicial

```bash
# 1. SSH al servidor (sin contraseña)
ssh -i finzapp-deploy ubuntu@finzapp.co

# 2. Actualizar sistema
sudo apt-get update && sudo apt-get upgrade -y

# 3. Instalar Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# 4. Instalar Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# 5. Crear directorio de aplicación
sudo mkdir -p /var/www/finzapp
sudo chown $USER:$USER /var/www/finzapp
```

### Deploy Inicial

```bash
# 1. Clonar en rama main
cd /var/www/finzapp
git clone -b main https://github.com/your-org/finzapp.git .

# 2. Crear .env con valores de producción
cp .env.example .env
nano .env

# *** IMPORTANTE: Cambiar estos valores ***
POSTGRES_PASSWORD=<STRONG_PASSWORD>
REDIS_PASSWORD=<STRONG_PASSWORD>
JWT_SECRET=<GENERAR_CON: openssl rand -hex 32>
JWT_REFRESH_SECRET=<GENERAR_CON: openssl rand -hex 32>
INGEST_API_KEY=<GENERAR_CLAVE_FUERTE>
NODE_ENV=production
DATABASE_URL=postgresql://finzapp_user:<STRONG_PASSWORD>@db:5432/finzapp
REDIS_URL=redis://:<STRONG_PASSWORD>@redis:6379

# 3. Build imágenes
docker-compose build

# 4. Crear volumen para datos persistentes
docker volume create pgdata

# 5. Levantar servicios
docker-compose up -d

# 6. Ejecutar migraciones
docker-compose exec api npm run prisma:migrate:deploy

# 7. Seed de datos iniciales (solo primera vez)
docker-compose exec api npm run prisma:seed

# 8. Verificar health
docker-compose ps
curl http://localhost:3000/api/v1/health
```

### Nginx Configuration

```nginx
# /etc/nginx/sites-available/finzapp

upstream api {
    server localhost:3000;
}

upstream nlp {
    server localhost:8001;
}

server {
    listen 80;
    server_name finzapp.co www.finzapp.co;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name finzapp.co www.finzapp.co;

    # SSL Certificates (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/finzapp.co/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/finzapp.co/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root location - serve static frontend
    root /var/www/finzapp;

    location / {
        try_files $uri $uri/ /index.html;
        proxy_pass http://localhost:80;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API proxy
    location /api/ {
        proxy_pass http://api/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # NLP Service proxy
    location /nlp/ {
        proxy_pass http://nlp/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # Compression
    gzip on;
    gzip_types text/plain text/css application/json application/javascript;
    gzip_min_length 1000;
}
```

Activar:

```bash
sudo ln -s /etc/nginx/sites-available/finzapp /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL Certificate (Let's Encrypt)

```bash
# Instalar certbot
sudo apt-get install certbot python3-certbot-nginx -y

# Generar certificado
sudo certbot certonly --nginx -d finzapp.co -d www.finzapp.co

# Auto-renewal
sudo certbot renew --dry-run
# (cron automático)
```

### Backup Automático

```bash
# /usr/local/bin/finzapp-backup.sh

#!/bin/bash
set -e

BACKUP_DIR="/backups/finzapp"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATABASE_BACKUP="$BACKUP_DIR/db_$TIMESTAMP.sql"
COMPOSE_PATH="/var/www/finzapp"

mkdir -p $BACKUP_DIR

# Backup database
cd $COMPOSE_PATH
docker-compose exec -T db pg_dump -U finzapp_user -d finzapp > $DATABASE_BACKUP
gzip $DATABASE_BACKUP

# Backup .env (encriptado)
openssl enc -aes-256-cbc -salt -in .env -out $BACKUP_DIR/.env_$TIMESTAMP.enc -k $BACKUP_PASSWORD

# Mantener últimos 30 días
find $BACKUP_DIR -name "db_*.sql.gz" -mtime +30 -delete
find $BACKUP_DIR -name ".env_*.enc" -mtime +30 -delete

# Subir a S3 (opcional)
# aws s3 cp $BACKUP_DIR s3://finzapp-backups/$TIMESTAMP/ --recursive

echo "Backup completado: $TIMESTAMP"
```

Programar con cron:

```bash
# Backup diario a las 2 AM
0 2 * * * /usr/local/bin/finzapp-backup.sh >> /var/log/finzapp-backup.log 2>&1
```

## Updates y Rollback

### Actualizar a nueva versión

```bash
cd /var/www/finzapp

# 1. Pull cambios
git fetch origin
git checkout main
git pull origin main

# 2. Crear backup antes de update
docker-compose exec db pg_dump -U finzapp_user finzapp > backup_pre_update.sql

# 3. Rebuild imágenes
docker-compose build

# 4. Stop servicios
docker-compose down

# 5. Ejecutar migraciones (si hay)
docker-compose up -d
docker-compose exec api npm run prisma:migrate:deploy

# 6. Verificar salud
sleep 10
curl http://localhost:3000/api/v1/health

# Si algo falla: ver Rollback más abajo
```

### Rollback a versión anterior

```bash
cd /var/www/finzapp

# 1. Recuperar de backup
docker-compose down
docker-compose exec db psql -U finzapp_user finzapp < backup_pre_update.sql

# 2. Checkout version anterior
git checkout <PREVIOUS_TAG>

# 3. Rebuild y restart
docker-compose build
docker-compose up -d

# 4. Verificar
curl http://localhost:3000/api/v1/health
```

## Monitoring

### Health Checks

```bash
# Verificar todos los servicios
docker-compose ps

# Logs
docker-compose logs -f api
docker-compose logs -f nlp-service
docker-compose logs -f db

# Estadísticas
docker stats

# Discos
df -h
```

### Alertas (recomendado)

- Uptime Robot: Monitor endpoint `/health`
- Sentry: Error tracking
- New Relic / Datadog: Performance monitoring
- AlertManager: Sistema de alertas

### Performance

```bash
# Verificar conexiones a BD
docker-compose exec db psql -U finzapp_user -c "SELECT count(*) FROM pg_stat_activity;"

# Tamaño de BD
docker-compose exec db psql -U finzapp_user -c "SELECT pg_size_pretty(pg_database_size('finzapp'));"

# Tamaño de volúmenes Docker
docker system df
```

## Troubleshooting

### Servicio no inicia

```bash
# Ver logs
docker-compose logs api

# Reintentar
docker-compose down
docker-compose up -d

# Clean slate
docker-compose down -v  # Cuidado: Borra datos
```

### Alta latencia

```bash
# Verificar recursos
docker stats

# Si CPU alta:
docker-compose exec api npm run bench

# Si memoria alta:
docker system prune -a
```

### Errores de conexión a BD

```bash
# Verificar conectividad
docker-compose exec api nc -zv db 5432

# Ver logs de DB
docker-compose logs db

# Resetear conexiones
docker-compose exec db psql -U finzapp_user -c "SELECT pg_terminate_backend(pg_stat_activity.pid);"
```

## Security Checklist

- [ ] SSL/TLS habilitado (HTTPS)
- [ ] Firewall solo permite 80/443
- [ ] SSH sin password (key-based)
- [ ] Fail2Ban habilitado
- [ ] Secrets en variables de entorno
- [ ] Database backups programados
- [ ] Logs monitoreados
- [ ] CORS restringido a dominio propio
- [ ] Rate limiting activado
- [ ] SQL injection checks
- [ ] CSRF tokens implementados
- [ ] Secrets rotados regularmente

## Variáveis Importantes

```bash
# NUNCA hardcodear en código
DATABASE_URL=postgresql://user:pass@host:5432/db
REDIS_URL=redis://:password@host:6379
JWT_SECRET=<32+ random characters>
INGEST_API_KEY=<API key for mobile>
NODE_ENV=production
VITE_API_URL=https://finzapp.co/api/v1
```

## Support

- Slack: #devops channel
- Email: devops@finzapp.co
- Docs: https://docs.finzapp.co/deployment
