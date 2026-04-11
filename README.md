# FakeStore BaaS

Backend-as-a-Service (BaaS) multi-tenant headless para e-commerce, com isolamento de dados via Row-Level Security (RLS), webhook engine, billing Stripe, frete nacional, upload de imagens e rate limiting por plano.

---

## Arquitetura

```text
[ Cliente HTTP ]
       |
       v
[ Express Server ]
       |
       +-- Helmet (seguranca)
       +-- Global Rate Limiter (1500 req/15min)
       +-- CORS
       +-- i18n Middleware
       |
       +-- /api-docs (Swagger UI)
       +-- /health (DB + Redis status check)
       |
       +-- EnsureTenant -- x-api-key -> SHA-256 -> Redis cache (5min) ou DB
       |       |
       |       +-- req.getTenantTrx() -> Lazy RLS-scoped transaction
       |               +-- SET LOCAL app.current_tenant_id = '{id}'
       |
       +-- Tenant Rate Limiter (Redis sliding window)
       +-- Request Logger (batch flush to DB via Redis queue)
       |
       +-- /v1/* Routes -> Validation (Yup) -> Controllers -> Services -> Providers
       |                                                          |
       |                                                          +-- Knex.js -> PostgreSQL (RLS)
       |
       +-- Error Middleware -> Pino (structured logging) + Sentry (5xx capture)

[ Webhook Worker (processo isolado) ]
       |
       +-- BullMQ Consumer (concurrency: 5)
       +-- HMAC-SHA256 signatures
       +-- Retry exponencial (5x, base 60s)
       +-- Audit trail -> webhook_events
```

### Fluxo de Requisicao

1. Request chega no Express com header `x-api-key`
2. `EnsureTenant` resolve o tenant via hash SHA-256 (cache Redis 5min)
3. `TenantRateLimiter` verifica limites do plano via Redis sliding window
4. Middlewares de autenticacao (`EnsureAuthenticated`, `EnsureAdmin`) validam JWT
5. Validacao de schema (Yup) garante integridade dos dados
6. Controller chama `req.getTenantTrx()` para obter transacao RLS-scoped
7. Provider executa queries - RLS filtra automaticamente por `tenant_id`
8. Transacao auto-commit (2xx-3xx) ou auto-rollback (4xx-5xx)

---

## Quick Start

```bash
# 1. Clone e instale
git clone https://github.com/IsaqueBatist/fakestore-backend.git
cd fakestore-backend
cp .env.example .env  # Preencha as credenciais

# 2. Suba PostgreSQL e Redis
docker compose up -d postgres redis

# 3. Instale e rode
npm install
npm run knex:migrate
npm run server

# 4. Acesse
# API:     http://localhost:3333
# Swagger: http://localhost:3333/api-docs
# Health:  http://localhost:3333/health
```

---

## Stack Tecnologica

| Componente | Tecnologia |
|-----------|-----------|
| Linguagem | TypeScript / Node.js 22 |
| Framework Web | Express 4.18 |
| Banco de Dados | PostgreSQL 16 (com RLS) |
| Query Builder | Knex.js 3.1 |
| Cache / Queue | Redis 7 + BullMQ |
| Validacao | Yup |
| Autenticacao | JWT RS256 + API Key (SHA-256) + API Secret (bcrypt) |
| Pagamentos | Stripe (checkout, portal, subscriptions) |
| Upload de Imagens | Cloudflare R2 (presigned URLs, $0 egress) |
| Frete | Melhor Envio (Correios, Jadlog, Azul Cargo) |
| Email | Resend (producao) / Ethereal (dev) |
| Observabilidade | Pino (structured JSON logging) + Sentry (error tracking) |
| IA | Anthropic Claude (assistente de integracao) |
| Documentacao | Swagger/OpenAPI auto-gerado |
| Testes | Jest + Supertest (215 testes) |
| Containerizacao | Docker multi-stage + Docker Compose |
| CI/CD | GitHub Actions |

---

## Multi-Tenancy

### Isolamento de Dados

O sistema utiliza **Row-Level Security (RLS)** nativo do PostgreSQL para garantir isolamento completo entre tenants:

- Todas as tabelas de negocio possuem coluna `tenant_id` (NOT NULL, FK)
- Politicas RLS com `FORCE ROW LEVEL SECURITY` impedem bypass
- `USING` filtra SELECT/UPDATE/DELETE; `WITH CHECK` valida INSERT/UPDATE
- Contexto definido por `SET LOCAL app.current_tenant_id` (escopo de transacao)
- Default automatico: `tenant_id` preenchido via `current_setting()` no INSERT
- **Soft delete via RLS:** registros com `deleted_at IS NOT NULL` sao invisiveis no banco

### Autenticacao de Tenant

```
x-api-key header -> SHA-256 hash -> Redis lookup (5min TTL) -> DB fallback
```

- API keys armazenadas como hash SHA-256 (nunca em plaintext)
- API secrets armazenados como hash bcrypt (12 rounds)
- Tenants inativos sao rejeitados automaticamente
- Trial de 14 dias com grace period de 7 dias e downgrade automatico

### Planos e Rate Limiting

| Plano | Rate Limit | Janela |
|-------|-----------|--------|
| Sandbox | 2 req/s | Sliding window |
| Basic | 10 req/s | Sliding window |
| Agency | 50 req/s | Sliding window |

Headers de resposta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

Rate limiting adicional:
- **Global:** 1500 req / 15 min
- **Autenticacao:** 10 tentativas / 15 min
- **Financeiro:** 10 req / 60 min
- **IA:** 5 req / 60s por tenant

---

## API v1

Todas as rotas de negocio estao em `/v1/`. Rotas de infraestrutura (`/health`, `/api-docs`) e onboarding (`/tenants/register`, `/billing/webhook`) nao tem versao.

### Autenticacao e Onboarding

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | `/tenants/register` | - | Cadastro de tenant |
| POST | `/tenants/credentials/rotate` | JWT+Admin | Rotacao de credenciais |
| POST | `/tenants/billing/checkout` | JWT+Admin | Checkout Stripe |
| POST | `/tenants/billing/portal` | JWT+Admin | Portal Stripe |
| GET | `/tenants/billing/verify` | JWT+Admin | Verificar checkout |
| POST | `/billing/webhook` | Stripe | Webhook de billing |

### Auth (requer x-api-key)

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | `/v1/login` | - | Autenticar e obter JWT |
| POST | `/v1/register` | - | Criar conta de usuario |
| POST | `/v1/forgot-password` | - | Solicitar reset de senha |
| POST | `/v1/reset-password` | - | Confirmar nova senha |

### Produtos

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET | `/v1/products` | - | Listar (cursor pagination, filtros, full-text search) |
| GET | `/v1/products/:id` | - | Detalhes do produto |
| GET | `/v1/products/:id/categories` | - | Categorias do produto |
| GET | `/v1/products/:id/comments` | - | Reviews do produto |
| POST | `/v1/products` | Admin | Criar produto |
| PUT | `/v1/products/:id` | Admin | Atualizar produto |
| DELETE | `/v1/products/:id` | Admin | Deletar (soft delete) |
| POST | `/v1/products/:id/comments` | JWT | Criar review |
| PUT | `/v1/products/:id/comments/:comment_id` | JWT | Atualizar review |
| DELETE | `/v1/products/:id/comments/:comment_id` | JWT | Deletar review |
| POST | `/v1/products/:id/categories` | Admin | Associar categoria |
| DELETE | `/v1/products/:id/categories/:category_id` | Admin | Desassociar categoria |

### Categorias

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET | `/v1/categories` | - | Listar categorias |
| GET | `/v1/categories/:id` | - | Detalhes da categoria |
| POST | `/v1/categories` | Admin | Criar categoria |
| PUT | `/v1/categories/:id` | Admin | Atualizar categoria |
| DELETE | `/v1/categories/:id` | Admin | Deletar categoria |

### Pedidos

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET | `/v1/orders` | JWT | Listar pedidos do usuario |
| GET | `/v1/orders/:id` | JWT | Detalhes do pedido |
| POST | `/v1/orders/from-cart` | JWT | Criar a partir do carrinho* |
| PUT | `/v1/orders/:id` | JWT | Atualizar status |
| DELETE | `/v1/orders/:id` | JWT | Cancelar |
| POST | `/v1/orders/:orderId/payment-confirmation` | API Secret | Confirmar pagamento (S2S)* |
| GET | `/v1/orders/:order_id/items` | JWT | Listar itens |
| POST | `/v1/orders/:order_id/items` | JWT | Adicionar item |
| PUT | `/v1/orders/:order_id/items/:id` | JWT | Atualizar item |
| DELETE | `/v1/orders/:order_id/items/:id` | JWT | Remover item |

*Requer header `Idempotency-Key`

### Carrinho

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET | `/v1/carts` | JWT | Obter carrinho do usuario |
| POST | `/v1/carts/items` | JWT | Adicionar item ao carrinho |
| GET | `/v1/carts/items` | JWT | Listar itens do carrinho |
| PUT | `/v1/carts/items/:id` | JWT | Atualizar quantidade |
| DELETE | `/v1/carts/items/:id` | JWT | Remover item |
| DELETE | `/v1/carts` | JWT | Limpar carrinho |

### Enderecos, Favoritos

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET/POST/PUT/DELETE | `/v1/addresses[/:id]` | JWT | CRUD de enderecos |
| GET/POST/DELETE | `/v1/favorites[/:id]` | JWT | Produtos favoritos |

### Cupons e Descontos

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET | `/v1/coupons` | Admin | Listar cupons |
| POST | `/v1/coupons` | Admin | Criar cupom |
| POST | `/v1/coupons/validate` | JWT | Validar e calcular desconto |
| PUT | `/v1/coupons/:id` | Admin | Atualizar cupom |
| DELETE | `/v1/coupons/:id` | Admin | Deletar cupom |

Tipos de desconto: `percentage` (basis points: 1500 = 15%) e `fixed` (centavos: 500 = R$5,00).

### Frete (Melhor Envio)

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | `/v1/shipping/quote` | - | Cotar frete (cache Redis 30min) |
| GET | `/v1/shipping/tracking/:code` | - | Rastrear encomenda |

Timeout de 4s via `AbortController` para evitar esgotamento de sockets.

### Upload de Imagens (Cloudflare R2)

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | `/v1/uploads/presign` | JWT | Gerar URL de upload (5min TTL) |

O binario **nunca passa pelo Node.js** - o cliente faz PUT direto na URL presigned do R2.

### Admin / Analytics

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| GET | `/v1/tenant/usage` | Admin | Estatisticas de uso |
| GET | `/v1/tenant/logs` | Admin | Logs de request |
| GET | `/v1/tenant/metrics/overview` | Admin | Metricas gerais |
| GET | `/v1/tenant/metrics/funnel` | Admin | Funil de conversao |
| GET | `/v1/webhooks/events` | Admin | Eventos de webhook |
| POST | `/v1/webhooks/events/:id/replay` | Admin | Reenviar webhook |

### IA

| Metodo | Rota | Auth | Descricao |
|--------|------|------|-----------|
| POST | `/v1/ai/ask` | API Secret | Perguntar ao assistente |

### Infraestrutura

| Rota | Descricao |
|------|-----------|
| `/api-docs` | Swagger UI (documentacao interativa) |
| `/health` | Health check detalhado (DB + Redis status) |

---

## Valores Monetarios

**Todos os valores monetarios sao em centavos (Integer).**

```
R$ 49,90 = 4990 (centavos)
Desconto 15% = 1500 (basis points)
Math.floor() para descontos percentuais
```

Isso evita bugs de ponto flutuante do JavaScript (`0.1 + 0.2 = 0.30000000000000004`). A conversao para reais acontece apenas no frontend/response.

---

## Seguranca

### Autenticacao (3 camadas)

1. **API Key (S2S):** `x-api-key` header -> SHA-256 hash -> Redis/DB lookup
2. **JWT (usuario):** `Authorization: Bearer <token>` -> RS256 com chaves assimatricas
3. **API Secret (S2S privilegiado):** `x-api-secret` header -> bcrypt verification

Validacao cross-tenant: JWT emitido para tenant A nao funciona no tenant B.

### Idempotencia

Endpoints POST de mutacao (ex: `POST /v1/orders/from-cart`) exigem header `Idempotency-Key`:

- Chaves armazenadas por tenant na tabela `idempotency_keys`
- Requests duplicados retornam resposta cacheada (mesmo status + body)
- Constraint unique: `(tenant_id, idempotency_key)`

### Soft Delete

Tabelas `product`, `orders` e `user` possuem `deleted_at`:

- Imposto via **RLS policy** (`AND deleted_at IS NULL` na clausula `USING`)
- Registros deletados sao invisiveis mesmo que o codigo Node.js esqueca o filtro
- Indices parciais para performance: `WHERE deleted_at IS NULL`

---

## Webhook Engine

Worker isolado em container Docker separado, consumindo jobs via BullMQ:

- **Eventos:** `order.created`, `order.awaiting_payment`, `order.paid`, `order.shipped`, `order.delivered`, `order.cancelled`
- **Assinatura:** HMAC-SHA256 com `webhook_secret` do tenant
- **Retry:** 5 tentativas com backoff exponencial (base: 60s)
- **Timeout:** 10 segundos por delivery
- **Concurrency:** 5 jobs simultaneos
- **Audit:** Todas as entregas registradas em `webhook_events`

### Payload de Webhook

```json
{
  "event": "order.paid",
  "data": { "order_id": 42, "total": 4990, "status": "paid" },
  "timestamp": "2026-04-11T12:00:00.000Z"
}
```

Headers: `X-Event-Type`, `X-Webhook-Signature`

---

## Observabilidade

### Logging (Pino)

- **Producao:** JSON structured logging (machine-readable)
- **Desenvolvimento:** pino-pretty com cores e timestamps
- **Testes:** silent (sem output)
- Request ID para correlacao de logs
- Zero `console.log` no runtime (70+ arquivos migrados)

### Error Tracking (Sentry)

- Captura automatica de erros 5xx no ErrorMiddleware
- Configuravel via `SENTRY_DSN` (free: 5K events/mes)
- Nao captura erros 4xx (validacao, auth) para evitar ruido

### Request Logging

- Todas as requisicoes logadas em `api_request_logs` (batch flush via Redis queue)
- Captura: method, path, status, duration, IP, tenant_id, user_id
- Admin pode consultar via `GET /v1/tenant/logs`

---

## Docker

```yaml
services:
  api:              # Express server (porta 3000)
  webhook-worker:   # BullMQ consumer (processo isolado)
  redis:            # Redis 7 Alpine (porta 6379)
  postgres:         # PostgreSQL 16 Alpine (porta 5432)
```

### Executar

```bash
# Desenvolvimento (so DB + Redis)
docker compose up -d postgres redis

# Producao (tudo)
docker compose up -d
```

### Build Multi-Stage

```dockerfile
# Stage 1: Build (node:22-alpine) - npm ci + tsc
# Stage 2: Runtime (node:22-alpine) - copia apenas build/, node_modules/, package.json
```

### Graceful Shutdown

O processo escuta `SIGTERM` e `SIGINT` para:
1. Parar de aceitar novas conexoes
2. Drenar requests em andamento
3. Parar o flush de logs
4. Fechar conexoes DB e Redis
5. Encerrar limpo (exit 0)

---

## Modelagem de Dados

Entidades principais (todas com `tenant_id` e RLS):

- **tenants** - Tenants com `api_key_hash`, `api_secret_hash`, `plan`, `webhook_url`, billing fields
- **user** - Usuarios com `name`, `email`, `password_hash`, `role`, `deleted_at`
- **product** - Catalogo com `name`, `description`, `price`, `stock`, `image_url`, `rating`, `specifications`, `deleted_at`
- **categories** - Categorias de produtos
- **product_categories** - Relacao N:N produtos <-> categorias
- **product_comments** - Reviews de usuarios em produtos
- **orders** - Pedidos com state machine (pending -> paid -> shipped -> delivered), `deleted_at`
- **order_items** - Itens do pedido com snapshot de preco (`unt_price`)
- **cart / cart_items** - Carrinho de compras (Redis-backed)
- **addresses** - Enderecos de entrega
- **user_favorites** - Produtos favoritos
- **coupons** - Cupons de desconto (percentage/fixed, centavos, RLS)
- **webhook_events** - Audit trail de webhooks
- **idempotency_keys** - Chaves de idempotencia por tenant
- **api_request_logs** - Logs de todas as requisicoes

---

## Variaveis de Ambiente

```bash
# Servidor
PORT=3333
NODE_ENV=development          # development | test | production
IS_LOCALHOST=true

# PostgreSQL (credenciais separadas: admin para DDL, app para DML)
DB_HOST=localhost
DB_PORT=5432
DB_ADMIN_USER=fakestore_admin
DB_ADMIN_PASSWORD=
DB_USER=fakestore_app
DB_PASSWORD=
DB_NAME=fakestore_dev
DB_NAME_TEST=fakestore_test
DB_NAME_PRODUCTION=fakestore
DB_SSL=false

# Autenticacao
JWT_SECRET=                    # HS256, ou use JWT_PRIVATE_KEY + JWT_PUBLIC_KEY para RS256

# CORS
ENABLED_CORS=http://localhost:3000   # separar multiplos com ;

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=

# Servicos opcionais
ANTHROPIC_API_KEY=             # IA (assistente de integracao)
SENTRY_DSN=                    # Error tracking (free: 5K events/mes)
R2_ENDPOINT=                   # Upload de imagens (Cloudflare R2, 10GB free)
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=
R2_BUCKET_NAME=fakestore-images
R2_PUBLIC_URL=
MELHOR_ENVIO_TOKEN=            # Frete nacional (free, paga so o frete real)
RESEND_API_KEY=                # Email transacional (free: 3K emails/mes)
EMAIL_FROM=FakeStore <noreply@fakestore.com.br>
```

---

## Scripts

| Script | Descricao |
|--------|-----------|
| `npm run server` | Dev server com hot reload (ts-node-dev) |
| `npm run build` | Compilar TypeScript para `build/` |
| `npm run production` | Executar codigo compilado |
| `npm test` | Rodar testes (28 suites, 215 testes) |
| `npm run knex:migrate` | Executar migrations |
| `npm run knex:rollback` | Rollback ultima migration |
| `npm run knex:rollback-all` | Rollback todas as migrations |
| `npm run knex:seed` | Popular banco com seeds |
| `npm run generate-openapi` | Gerar openapi.json |
| `npm run generate-sdk` | Gerar SDK TypeScript do OpenAPI |

---

## Testes

```bash
npm test  # 28 suites, 215 testes

# Integracao (13 suites):
#   auth, products, categories, orders, carts, addresses,
#   favorites, tenants, coupons, uploads, shipping, health, RLS

# Unitarios (15 suites):
#   middlewares (7), services (5), utils (1), errors (1), logger (1)
```

---

## Gerar SDK

```bash
npm run generate-sdk
# Output: ./sdk/ (TypeScript SDK pronto)
# import { ProductsApi, Configuration } from '@fakestore/sdk'
```

Usa `openapi-generator-cli` com o `openapi.json` ja existente. Custo: zero.

---

## CI/CD

Pipeline GitHub Actions (`.github/workflows/ci.yml`):

1. **Trigger:** Push/PR para `main`
2. **Servicos:** PostgreSQL 16 + Redis
3. **Setup:** Cria roles DB separados (admin + app), configura RLS
4. **Execucao:** Migrations com admin user, testes com app user (RLS ativo)
5. **Coverage:** Upload de artefato com retencao de 7 dias

---

## Estrutura de Diretorios

```
src/
  index.ts                 # Entry point + graceful shutdown
  worker.ts                # Webhook worker (BullMQ, container separado)
  server/
    server.ts              # Express app + middlewares + Sentry
    routes/                # 14 arquivos por dominio (montados em /v1/)
    controllers/           # Request handlers (thin layer)
    services/              # Business logic (orders, coupons, shipping, ai)
    database/
      knex/                # Configuracao Knex (dual credentials)
      migrations/          # 25 migrations (tabelas + RLS + soft delete)
      models/              # Interfaces TypeScript
      providers/           # Data access layer
      seeds/               # Seeds para dados iniciais
    errors/                # AppError, BadRequest, NotFound, etc.
    shared/
      middlewares/         # Tenant, Auth, Admin, RateLimit, Idempotency, Validation
      services/            # JWT, Redis, Email, Logger, Image, Webhook, OTP
      utils/               # Cursor pagination
      i18n/                # Internacionalizacao (pt-BR, en)
tests/
  helpers/                 # testDb, factories, testAuth, mockRequest
  integration/             # 13 suites (routes + RLS isolation)
  unit/                    # 15 suites (middlewares, services, utils, errors)
docs/
  backend/                 # SwaggerConfig
scripts/
  generate-openapi.ts      # Gera openapi.json
  generate-sdk.sh          # Gera SDK TypeScript via openapi-generator-cli
```

---

## Licenca

MIT
