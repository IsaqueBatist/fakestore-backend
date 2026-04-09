# FakeStore Backend

Backend-as-a-Service (BaaS) multi-tenant para e-commerce, com isolamento de dados via Row-Level Security (RLS), webhook engine, rate limiting por plano e containerização Docker.

---

## Arquitetura

```text
[ Cliente HTTP ]
       │
       ▼
[ Express Server ]
       │
       ├── Helmet (segurança)
       ├── Global Rate Limiter (1500 req/15min)
       ├── CORS
       ├── i18n Middleware
       │
       ├── /api-docs (Swagger UI)
       ├── /health
       │
       ├── EnsureTenant ── x-api-key → SHA-256 → Redis cache (5min) ou DB
       │       │
       │       └── req.getTenantTrx() → Lazy RLS-scoped transaction
       │               └── SET LOCAL app.current_tenant_id = '{id}'
       │
       ├── Tenant Rate Limiter (Redis sliding window)
       │
       ├── Routes → Validation (Yup) → Controllers → Services → Providers
       │                                                   │
       │                                                   └── Knex.js → PostgreSQL (RLS)
       │
       └── Error Middleware

[ Webhook Worker (processo isolado) ]
       │
       ├── BullMQ Consumer (concurrency: 5)
       ├── HMAC-SHA256 signatures
       ├── Retry exponencial (5x, base 60s)
       └── Audit trail → webhook_events
```

### Fluxo de Requisição

1. Request chega no Express com header `x-api-key`
2. `EnsureTenant` resolve o tenant via hash SHA-256 (cache Redis 5min)
3. `TenantRateLimiter` verifica limites do plano via Redis sliding window
4. Middlewares de autenticação (`EnsureAuthenticated`, `EnsureAdmin`) validam JWT
5. Validação de schema (Yup) garante integridade dos dados
6. Controller chama `req.getTenantTrx()` para obter transação RLS-scoped
7. Provider executa queries - RLS filtra automaticamente por `tenant_id`
8. Transação auto-commit (2xx-3xx) ou auto-rollback (4xx-5xx)

---

## Multi-Tenancy

### Isolamento de Dados

O sistema utiliza **Row-Level Security (RLS)** nativo do PostgreSQL para garantir isolamento completo entre tenants:

- Todas as tabelas de negócio possuem coluna `tenant_id` (NOT NULL, FK)
- Políticas RLS com `FORCE ROW LEVEL SECURITY` impedem bypass
- `USING` filtra SELECT/UPDATE/DELETE; `WITH CHECK` valida INSERT/UPDATE
- Contexto definido por `SET LOCAL app.current_tenant_id` (escopo de transação)
- Default automático: `tenant_id` preenchido via `current_setting()` no INSERT

### Autenticação de Tenant

```
x-api-key header → SHA-256 hash → Redis lookup (5min TTL) → DB fallback
```

- API keys armazenadas como hash SHA-256 (nunca em plaintext)
- API secrets armazenados como hash bcrypt
- Tenants inativos são rejeitados automaticamente

### Planos e Rate Limiting

| Plano   | Rate Limit | Janela         |
| ------- | ---------- | -------------- |
| Sandbox | 2 req/s    | Sliding window |
| Basic   | 10 req/s   | Sliding window |
| Agency  | 50 req/s   | Sliding window |

Headers de resposta: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `Retry-After`

---

## Stack Tecnológica

| Componente      | Tecnologia                       |
| --------------- | -------------------------------- |
| Linguagem       | TypeScript / Node.js 22          |
| Framework Web   | Express 4.18                     |
| Banco de Dados  | PostgreSQL 16 (com RLS)          |
| Query Builder   | Knex.js 3.1                      |
| Cache / Queue   | Redis 7                          |
| Webhook Queue   | BullMQ                           |
| Validação       | Yup                              |
| Autenticação    | JWT + bcryptjs                   |
| Segurança       | Helmet, CORS, express-rate-limit |
| Testes          | Jest + Supertest                 |
| Containerização | Docker + Docker Compose          |
| CI/CD           | GitHub Actions                   |

---

## Segurança

### Rate Limiting (2 camadas)

- **Global:** 1500 requisições / 15 minutos (express-rate-limit)
- **Autenticação:** 10 tentativas / 15 minutos (login, register, forgot/reset password)
- **Per-tenant:** Sliding window via Redis (varia por plano)

### Idempotência

Endpoints POST de mutação (ex: `POST /orders/from-cart`) exigem header `Idempotency-Key`:

- Chaves armazenadas por tenant na tabela `idempotency_keys`
- Requests duplicados retornam resposta cacheada (mesmo status + body)
- Constraint unique: `(tenant_id, idempotency_key)`

### Autenticação de Usuário

- JWT via header `Authorization: Bearer <token>`
- Payload contém `uid`, `role` e `tenant_id`
- Validação cross-tenant: JWT emitido para tenant A não funciona no tenant B
- Senhas com hash bcrypt (salt rounds: 8)

---

## Webhook Engine

Worker isolado em container Docker separado, consumindo jobs via BullMQ:

- **Eventos:** `order.created`, `order.status_changed`
- **Assinatura:** HMAC-SHA256 com `webhook_secret` do tenant
- **Retry:** 5 tentativas com backoff exponencial (base: 60s)
- **Timeout:** 10 segundos por delivery
- **Concurrency:** 5 jobs simultâneos
- **Audit:** Todas as entregas registradas em `webhook_events` (status, response_code, attempts)

### Payload de Webhook

```json
{
  "event": "order.created",
  "data": { ... },
  "timestamp": "2026-04-05T12:00:00.000Z"
}
```

Headers:

- `X-Event-Type`: Tipo do evento
- `X-Webhook-Signature`: HMAC-SHA256 do body

---

## Docker

O projeto utiliza Docker Compose com 4 serviços:

```yaml
services:
  api: # Express server (porta 3000)
  webhook-worker: # BullMQ consumer (processo isolado)
  redis: # Redis 7 Alpine (porta 6379)
  postgres: # PostgreSQL 16 Alpine (porta 5432)
```

### Build Multi-Stage

```dockerfile
# Stage 1: Build (node:22-alpine)
npm ci → npm run build

# Stage 2: Runtime (node:22-alpine)
Copia apenas build/, node_modules/, package.json
```

### Executar com Docker

```bash
docker-compose up -d
```

---

## Endpoints

### Autenticação

| Metodo | Rota             | Auth | Descrição                |
| ------ | ---------------- | ---- | ------------------------ |
| POST   | /login           | -    | Autenticar e obter JWT   |
| POST   | /register        | -    | Criar conta de usuário   |
| POST   | /forgot-password | -    | Solicitar reset de senha |
| POST   | /reset-password  | -    | Confirmar nova senha     |

### Produtos (Leitura Pública)

| Metodo | Rota                     | Auth | Descrição                  |
| ------ | ------------------------ | ---- | -------------------------- |
| GET    | /products                | -    | Listar (cursor pagination) |
| GET    | /products/:id            | -    | Detalhes do produto        |
| GET    | /products/:id/categories | -    | Categorias do produto      |
| GET    | /products/:id/comments   | -    | Comentários do produto     |

### Categorias (Leitura Pública)

| Metodo | Rota            | Auth | Descrição             |
| ------ | --------------- | ---- | --------------------- |
| GET    | /categories     | -    | Listar categorias     |
| GET    | /categories/:id | -    | Detalhes da categoria |

### Comentários (Autenticado)

| Metodo | Rota                               | Auth | Descrição            |
| ------ | ---------------------------------- | ---- | -------------------- |
| POST   | /products/:id/comments             | User | Criar comentário     |
| PUT    | /products/:id/comments/:comment_id | User | Atualizar comentário |
| DELETE | /products/:id/comments/:comment_id | User | Deletar comentário   |

### Pedidos (Autenticado)

| Metodo | Rota                        | Auth | Descrição                   |
| ------ | --------------------------- | ---- | --------------------------- |
| GET    | /orders                     | User | Listar pedidos do usuário   |
| GET    | /orders/:id                 | User | Detalhes do pedido          |
| POST   | /orders/from-cart           | User | Criar pedido do carrinho \* |
| PUT    | /orders/:id                 | User | Atualizar pedido            |
| DELETE | /orders/:id                 | User | Deletar pedido              |
| GET    | /orders/:order_id/items     | User | Listar itens do pedido      |
| POST   | /orders/:order_id/items     | User | Adicionar item ao pedido    |
| PUT    | /orders/:order_id/items/:id | User | Atualizar item do pedido    |
| DELETE | /orders/:order_id/items/:id | User | Remover item do pedido      |

\* Requer header `Idempotency-Key`

### Carrinho (Autenticado)

| Metodo | Rota             | Auth | Descrição                  |
| ------ | ---------------- | ---- | -------------------------- |
| GET    | /carts           | User | Obter carrinho do usuário  |
| GET    | /carts/items     | User | Listar itens do carrinho   |
| POST   | /carts/items     | User | Adicionar item ao carrinho |
| PUT    | /carts/items/:id | User | Atualizar quantidade       |
| DELETE | /carts/items/:id | User | Remover item               |
| DELETE | /carts           | User | Limpar carrinho            |

### Enderecos (Autenticado)

| Metodo | Rota           | Auth | Descrição            |
| ------ | -------------- | ---- | -------------------- |
| GET    | /addresses     | User | Listar enderecos     |
| GET    | /addresses/:id | User | Detalhes do endereco |
| POST   | /addresses     | User | Criar endereco       |
| PUT    | /addresses/:id | User | Atualizar endereco   |
| DELETE | /addresses/:id | User | Deletar endereco     |

### Favoritos (Autenticado)

| Metodo | Rota           | Auth | Descrição          |
| ------ | -------------- | ---- | ------------------ |
| GET    | /favorites     | User | Listar favoritos   |
| POST   | /favorites     | User | Adicionar favorito |
| DELETE | /favorites/:id | User | Remover favorito   |

### Administracao (Admin)

| Metodo | Rota                                  | Auth  | Descrição             |
| ------ | ------------------------------------- | ----- | --------------------- |
| POST   | /products                             | Admin | Criar produto         |
| PUT    | /products/:id                         | Admin | Atualizar produto     |
| DELETE | /products/:id                         | Admin | Deletar produto       |
| POST   | /products/:id/categories              | Admin | Associar categoria    |
| DELETE | /products/:id/categories/:category_id | Admin | Desassociar categoria |
| POST   | /categories                           | Admin | Criar categoria       |
| PUT    | /categories/:id                       | Admin | Atualizar categoria   |
| DELETE | /categories/:id                       | Admin | Deletar categoria     |

### Infraestrutura

| Rota      | Descrição                            |
| --------- | ------------------------------------ |
| /api-docs | Swagger UI (documentacao interativa) |
| /health   | Health check                         |

---

## Modelagem de Dados

Entidades principais (todas com `tenant_id` e RLS):

- **tenants** - Tenants com `api_key_hash`, `api_secret_hash`, `plan`, `webhook_url`, `webhook_secret`
- **user** - Usuarios com `name`, `email`, `password_hash`, `role` (user/admin)
- **products** - Catalogo com `name`, `description`, `price`, `image_url`, `rating`, `specifications`
- **categories** - Categorias de produtos
- **product_categories** - Relacao N:N entre produtos e categorias
- **product_comments** - Comentarios/reviews de usuarios em produtos
- **carts / cart_items** - Carrinho de compras por usuario
- **orders / order_items** - Pedidos com snapshot de preco (`unt_price`)
- **addresses** - Enderecos de entrega
- **user_favorites** - Produtos favoritos
- **webhook_events** - Audit trail de webhooks
- **idempotency_keys** - Chaves de idempotencia por tenant

---

## Configuracao

### Variaveis de Ambiente

```bash
# Servidor
PORT=3333
NODE_ENV=development          # development | test | production
IS_LOCALHOST=false

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_ADMIN_USER=fakestore_admin  # Usado para migrations/DDL
DB_ADMIN_PASSWORD=
DB_USER=fakestore_app          # Usado em runtime (DML, RLS-scoped)
DB_PASSWORD=
DB_NAME=fakestore_dev
DB_NAME_TEST=fakestore_test
DB_NAME_PRODUCTION=fakestore
DB_SSL=false

# Autenticacao
JWT_SECRET=

# CORS
ENABLED_CORS=http://localhost:3000

# Redis
REDIS_HOST=127.0.0.1
REDIS_PORT=6379
REDIS_PASSWORD=
```

### Executar Localmente

```bash
# Instalar dependencias
npm install

# Executar migrations (usa DB_ADMIN_USER)
npm run knex:migrate

# (Opcional) Popular banco com dados iniciais
npm run knex:seed

# Iniciar servidor em modo dev (hot-reload)
npm run server
```

### Scripts

| Script                 | Descricao                          |
| ---------------------- | ---------------------------------- |
| `npm run server`       | Dev server com ts-node-dev         |
| `npm run build`        | Transpila TypeScript para `build/` |
| `npm run production`   | Executa codigo transpilado         |
| `npm test`             | Roda testes com Jest               |
| `npm run knex:migrate` | Executa migrations                 |
| `npm run knex:seed`    | Popula banco com seeds             |

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
  @types/              # Tipos customizados (Express augmentation)
  server/
    controllers/       # Controllers por dominio (products, user, Orders, etc.)
    database/
      knex/            # Configuracao Knex (dual credentials)
      migrations/      # 17 migrations (tabelas + tenant_id + RLS)
      models/          # Interfaces TypeScript das entidades
      providers/       # Data access + logica de negocio
      seeds/           # Seeds para dados iniciais
    errors/            # Classes de erro customizadas
    routes/            # Definicao de rotas com Swagger docs
    services/          # Servicos de dominio (orders, carts, user)
    shared/
      middlewares/     # EnsureTenant, Auth, Admin, Idempotency, RateLimiters
      services/        # JWT, PasswordCrypto, Redis, Webhook
      utils/           # Cursor pagination helpers
    server.ts          # Setup do Express
  index.ts             # Entry point da API
  worker.ts            # Entry point do webhook worker
tests/
  helpers/             # Test DB setup, tenant factories
  integration/         # Testes de integracao (RLS isolation, endpoints)
  unit/                # Testes unitarios (providers, services)
```
