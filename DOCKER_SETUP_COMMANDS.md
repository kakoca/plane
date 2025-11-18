# 🐳 Comandos Docker - Plane Backend

## Para Desenvolvimento Local (Recomendado)

```bash
# 1. Subir apenas os serviços necessários (API + Database + Redis + MinIO + RabbitMQ)
docker-compose -f docker-compose-local.yml up -d

# 2. Ver logs em tempo real
docker-compose -f docker-compose-local.yml logs -f api

# 3. Parar os serviços
docker-compose -f docker-compose-local.yml down

# 4. Reiniciar apenas a API (útil após mudanças)
docker-compose -f docker-compose-local.yml restart api

# 5. Reconstruir a API (se houver mudanças no código Python)
docker-compose -f docker-compose-local.yml build api
docker-compose -f docker-compose-local.yml up -d api

# 6. Verificar status dos containers
docker-compose -f docker-compose-local.yml ps
```

## Endpoints Disponíveis

Quando rodando com `docker-compose-local.yml`:
- **API Backend**: http://localhost:8000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **MinIO**: http://localhost:9000 (console: http://localhost:9090)

## Para Produção Completa

```bash
# Subir todo o stack (Web + API + Admin + Space + Proxy)
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar tudo
docker-compose down
```

## Troubleshooting

### Problema: Containers não iniciam
```bash
# Limpar tudo e reiniciar
docker-compose -f docker-compose-local.yml down -v
docker-compose -f docker-compose-local.yml up -d
```

### Problema: API não conecta ao banco
```bash
# Verificar logs do banco
docker-compose -f docker-compose-local.yml logs plane-db

# Verificar se o migrator rodou
docker-compose -f docker-compose-local.yml logs migrator
```

### Problema: Mudanças no código não refletem
```bash
# Rebuild forçado
docker-compose -f docker-compose-local.yml build --no-cache api
docker-compose -f docker-compose-local.yml up -d api
```

## Verificar se a API está respondendo

```bash
# Teste de saúde
curl http://localhost:8000/api/

# Verificar endpoint de graph (nosso novo endpoint)
curl http://localhost:8000/api/workspaces/YOUR_WORKSPACE/graph/