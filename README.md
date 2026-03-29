# Documentação Técnica: FakeStore Backend

**Autor:** Manus AI
**Data:** 29 de Março de 2026

---

## 1. Visão Geral do Projeto

O **FakeStore Backend** é uma API RESTful desenvolvida para suportar operações de e-commerce. O sistema gerencia o catálogo de produtos, carrinhos de compras, processamento de pedidos, perfis de usuários, endereços e favoritos.

**Problema que resolve:** Fornece a infraestrutura de backend necessária para uma loja virtual (e-commerce), permitindo o gerenciamento de produtos por administradores e a jornada de compra por clientes finais.

**Público-alvo:** Desenvolvedores frontend ou mobile que necessitam de uma API robusta para integrar interfaces de e-commerce, bem como administradores da loja.

**Principais funcionalidades:**
- Autenticação e autorização baseada em papéis (User/Admin).
- Gerenciamento de catálogo de produtos, categorias e detalhes.
- Interações de usuários (comentários em produtos e favoritos).
- Gestão de carrinho de compras.
- Processamento de pedidos a partir do carrinho.
- Gerenciamento de endereços de entrega.

---

## 2. Arquitetura do Sistema

O projeto adota uma arquitetura em camadas semelhante ao padrão **MVC (Model-View-Controller)** adaptado para APIs REST, focando na separação de responsabilidades entre roteamento, controle de requisições e acesso a dados.

### Descrição dos Módulos:
- **Routes:** Define os endpoints e aplica middlewares de autenticação e validação.
- **Controllers:** Lida com a entrada HTTP (req, res), valida o corpo da requisição usando a biblioteca `yup` e repassa a lógica para a camada de dados.
- **Providers (Data Access / Repositories):** Contém a lógica de negócio e as consultas diretas ao banco de dados utilizando o query builder `Knex.js`.
- **Models:** Define as interfaces TypeScript para as entidades do banco de dados.
- **Shared / Services:** Serviços auxiliares (ex: JWT, criptografia de senhas) e middlewares globais (ex: tratamento de erros).

### Diagrama Textual da Arquitetura:
```text
[ Cliente HTTP ]
       │
       ▼
[ Routes (Express) ] ──(Middlewares de Auth/Admin)──┐
       │                                            │
       ▼                                            ▼
[ Middlewares de Validação (Yup) ]          [ Error Middleware ]
       │
       ▼
[ Controllers ] ──(Lida com req/res e extrai parâmetros)
       │
       ▼
[ Providers ] ──(Lógica de negócio e acesso a dados)
       │
       ▼
[ Query Builder (Knex.js) ]
       │
       ▼
[ Banco de Dados (MSSQL) ]
```

### Fluxo de Requisição:
1. A requisição atinge o **Router**.
2. Passa por **Middlewares** de autenticação (`EnsureAuthenticated`, `EnsureAdmin`) e validação de dados (`Validation` com Yup).
3. O **Controller** recebe a requisição, extrai os dados validados e chama o **Provider** correspondente.
4. O **Provider** executa a lógica de negócio e as operações no banco de dados via **Knex**.
5. O resultado ou erro sobe de volta para o Controller, que formata a resposta HTTP, ou é capturado pelo **Error Middleware** global.

---

## 3. Estrutura de Diretórios

A estrutura do projeto está centralizada na pasta `src/server/`.

| Diretório | Responsabilidade |
|---|---|
| `src/@types/` | Definições de tipos TypeScript customizadas (ex: estendendo o `Request` do Express). |
| `src/server/controllers/` | Controladores agrupados por domínio (produtos, usuários, pedidos, etc.). Observação: existe um erro de digitação na pasta `catergories`. |
| `src/server/database/` | Camada de dados. Contém as configurações do Knex. |
| `src/server/database/migrations/` | Scripts de criação e alteração de tabelas do banco de dados. |
| `src/server/database/models/` | Interfaces TypeScript representando as entidades do banco de dados. |
| `src/server/database/providers/` | Funções de acesso ao banco de dados e regras de negócio. |
| `src/server/database/seeds/` | Scripts para popular o banco de dados com dados iniciais. |
| `src/server/errors/` | Classes de erro customizadas (ex: `NotFoundError`, `UnauthorizedError`). |
| `src/server/routes/` | Definição das rotas da API (`index.ts`). |
| `src/server/shared/middlewares/` | Interceptadores de requisição (autenticação, validação de schemas, tratamento de erros). |
| `src/server/shared/services/` | Serviços utilitários como geração de JWT e hashing de senhas. |

---

## 4. Stack Tecnológica

- **Linguagem:** TypeScript / Node.js (v22.x)
- **Framework Web:** Express (v4.18)
- **Banco de Dados:** Microsoft SQL Server (MSSQL)
- **Query Builder:** Knex.js (v3.1)
- **Validação de Dados:** Yup
- **Autenticação:** JSON Web Token (JWT) e bcryptjs para hashing
- **Testes:** Jest, Supertest
- **Ferramentas de Desenvolvimento:** ESLint, ts-node-dev, cross-env

---

## 5. Modelagem de Dados

O banco de dados relacional é estruturado com as seguintes entidades principais:

- **Users (`user`):** Armazena `id_user`, `name`, `email`, `password_hash` e `role` (padrão 'user', ou 'admin').
- **Products (`products`):** Armazena o catálogo (`id_product`, `name`, `description`, `price`, `image_url`, `rating`).
- **Categories (`categories`):** Categorias de produtos. Relacionamento N:N com produtos através da tabela `product_categories`.
- **Carts & Cart Items (`carts`, `cart_items`):** O carrinho de um usuário e seus itens (relacionados a produtos com quantidade).
- **Orders & Order Items (`orders`, `order_items`):** Pedidos finalizados (`id_order`, `user_id`, `total`, `status`). Os itens do pedido (`order_items`) salvam uma "fotografia" do preço no momento da compra (`unt_price`).
- **Addresses (`addresses`):** Endereços vinculados aos usuários.
- **Interações:** Comentários em produtos (`product_comments`), detalhes técnicos (`product_details`) e produtos favoritos dos usuários (`user_favorites`).

---

## 6. Camadas da Aplicação

### Controllers
Responsáveis exclusivamente por receber a requisição (`req`), chamar os validadores do Yup, repassar os dados limpos para os Providers e retornar a resposta HTTP (`res.status().json()`).

### Providers (Services / Data Access)
No FakeStore, os Providers acumulam duas funções: **Data Access Object (DAO)** e **Service (Lógica de Negócio)**. Eles recebem os dados do Controller, executam regras de negócio (como verificar se um email já existe) e realizam as queries SQL via Knex. Em fluxos complexos, utilizam transações do banco de dados.

### Middlewares
- **Validation:** Middleware genérico que compila schemas do Yup para validar `body`, `query`, `params` ou `header`.
- **EnsureAuthenticated:** Valida o token JWT no header `Authorization`, extrai o ID do usuário e a role, e os injeta em `req.user`.
- **EnsureAdmin:** Verifica se `req.user.role` é igual a 'admin'.
- **ErrorMiddleware:** Captura exceções lançadas na aplicação (como instâncias de `AppError`) e formata a resposta de erro padronizada.

### Validações
Implementadas com a biblioteca `Yup`. Cada Controller geralmente exporta middlewares de validação específicos (ex: `signInValidation`, `createValidation`) que garantem a integridade dos dados antes de atingirem a lógica principal.

---

## 7. Fluxos Críticos

### Criação de Usuário (SignUp)
1. Cliente envia `POST /register` com `name`, `email` e `password`.
2. O validador Yup garante o formato dos dados.
3. `UserProvider.create` é chamado:
   - Verifica se o `email` já existe no banco (lança `ConflictError` se sim).
   - Realiza o hash da senha usando `bcryptjs` (serviço `PasswordCrypto`).
   - Insere o novo usuário no banco de dados.
4. Imediatamente após a criação do usuário, um carrinho vazio é provisionado chamando `CartProvider.createCart`.
5. Retorna HTTP 201 com o ID do usuário criado.

### Autenticação (SignIn)
1. Cliente envia `POST /login` com `email` e `password`.
2. `UserProvider.getByEmail` busca o usuário.
3. `PasswordCrypto.verifyPassword` compara a senha enviada com o `password_hash` armazenado.
4. Se válido, `JWTService.sign` gera um token contendo `uid` e `role`.
5. Retorna HTTP 200 com o `accessToken`.

### Processamento de Pedido a partir do Carrinho (`POST /orders/from-cart`)
Este é o fluxo de negócio mais complexo e utiliza transações de banco de dados para garantir consistência:
1. A requisição autenticada aciona `OrderProvider.create`.
2. Uma transação do Knex é iniciada.
3. O carrinho do usuário é bloqueado para leitura concorrente (`forUpdate`).
4. Um novo registro em `orders` é criado com total 0.
5. Os itens do carrinho (`cart_items`) são recuperados.
6. Para cada item, o preço atual do produto é consultado.
7. Os itens são inseridos em `order_items` com a quantidade e o preço unitário daquele momento (`unt_price`).
8. O valor total do pedido é calculado e a tabela `orders` é atualizada.
9. Todos os itens do carrinho são deletados (limpeza do carrinho).
10. A transação é comitada (commit) e o ID do pedido é retornado.
*(Se ocorrer qualquer falha, a transação sofre rollback e lança um `DatabaseError`)*.

---

## 8. API Endpoints Principais

A API é dividida em acesso público, autenticado e administrador.

### Autenticação
- `POST /login` - Autentica usuário e retorna JWT.
- `POST /register` - Cria novo usuário.

### Produtos (Público)
- `GET /products` - Lista produtos (suporta paginação e filtros).
- `GET /products/:id` - Detalhes de um produto específico.
- `GET /products/:id/categories` - Categorias de um produto.
- `GET /products/:id/comments` - Comentários de um produto.

### Carrinho e Pedidos (Autenticado)
- `GET /carts` - Retorna o carrinho do usuário logado.
- `POST /carts/items` - Adiciona item ao carrinho.
- `POST /orders/from-cart` - Transforma o carrinho atual em um pedido finalizado.
- `GET /orders` - Lista os pedidos do usuário logado.

### Administração (Requer Role 'admin')
- `POST /products` - Cria novo produto.
- `PUT /products/:id` - Atualiza produto.
- `DELETE /products/:id` - Remove produto.
- `POST /categories` - Cria nova categoria.

---

## 9. Autenticação e Segurança

- **Estratégia:** JSON Web Tokens (JWT) transmitidos via header `Authorization: Bearer <token>`.
- **Proteções:**
  - Senhas não são salvas em texto plano; utiliza-se `bcryptjs` com salt de 8 rounds.
  - Rotas sensíveis protegidas pelo middleware `EnsureAuthenticated`.
  - Rotas de gestão de catálogo protegidas pelo middleware `EnsureAdmin`.
- **Tratamento de Erros:** O sistema não vaza stack traces para o cliente; o `ErrorMiddleware` intercepta falhas e retorna mensagens amigáveis (ex: `AppError`).

**Pontos Vulneráveis Identificados:**
- O CORS está configurado, mas depende da variável `ENABLED_CORS`. Se não definida, permite acesso de qualquer origem (`*`), o que é perigoso em produção.
- Não há implementação visível de Rate Limiting para rotas de autenticação, abrindo brecha para ataques de força bruta no `/login`.

---

## 10. Configuração e Execução

### Variáveis de Ambiente (`.env`)
O projeto requer um arquivo `.env` na raiz. Um arquivo `.env.example` é fornecido. Variáveis essenciais incluem:
- `DB_SERVER`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` (Configurações do MSSQL).
- `JWT_SECRET` (Chave para assinatura dos tokens).
- `PORT` (Porta do servidor Node).

### Como Rodar Localmente
1. Instale as dependências: `npm install`
2. Execute as migrations do banco: `npm run knex:migrate`
3. (Opcional) Popule o banco: `npm run knex:seed`
4. Inicie o servidor em modo dev: `npm run server`

### Scripts Disponíveis
- `npm run server`: Roda o servidor com `ts-node-dev` para hot-reload.
- `npm run build`: Transpila o TypeScript para a pasta `build/`.
- `npm run production`: Executa o código transpilado.
- `npm run test`: Roda a suíte de testes com Jest.

---

## 14. Conclusão Técnica

O projeto **FakeStore Backend** apresenta uma arquitetura sólida e bem estruturada, condizente com o nível de um desenvolvedor **Pleno**. A utilização de TypeScript, validação de schemas com Yup, tratamento centralizado de erros e, principalmente, o uso correto de transações de banco de dados para fluxos críticos (pedidos) demonstram maturidade técnica.

**Prontidão para Produção:** O sistema está funcional, mas **não está 100% pronto para produção em larga escala**. Antes do deploy produtivo, é essencial implementar logs estruturados, rate limiting, corrigir as configurações de CORS e, idealmente, adicionar uma camada de cache para a listagem de produtos. Com esses ajustes, a aplicação se tornará altamente robusta e escalável.
