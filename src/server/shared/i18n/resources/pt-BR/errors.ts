export const errors = {
  not_found: "{{resource}} nao encontrado(a)",
  unauthorized: "Usuario nao autenticado",
  user_not_logged_in: "O usuario deve estar logado",
  incorrect_credentials: "Email ou senha incorretos",
  email_already_registered: "Email ja registrado",
  access_denied_admins_only: "Acesso negado: apenas administradores.",
  invalid_token_format: "Formato de token invalido",
  invalid_or_expired_token: "Token invalido ou expirado",
  token_expired: "O token fornecido expirou.",
  param_required: "O parametro {{param}} precisa ser informado",
  product_id_required: "O ID do produto deve ser fornecido na URL.",
  resource_already_exists: "{{resource}} ja existe",
  forbidden_action:
    "Voce nao tem permissao para {{action}} este(a) {{resource}}",
  unable_to_increase_quantity: "Nao foi possivel aumentar a quantidade do item",
  unable_to_add_item: "Nao foi possivel adicionar o item",
  unable_to_recalculate_total: "Nao foi possivel recalcular o total",
  items_not_found: "Itens do(a) {{resource}} nao encontrados",
  some_products_not_found: "Alguns produtos nao foram encontrados",
  jwt_secret_not_configured:
    "A variavel de ambiente JWT_SECRET nao esta configurada",
  db_error_registering: "Erro ao registrar registro",
  db_error_updating: "Erro ao atualizar {{resource}}",
  db_error_deleting: "Erro ao deletar {{resource}}",
  db_error_getting: "Erro ao buscar {{resource}}",
  db_error_getting_all: "Erro ao buscar todos(as) {{resource}}",
  db_error_count: "Erro interno do banco de dados durante operacao de contagem",
  db_error_creating: "Erro do banco de dados ao criar {{resource}}",
  db_error_adding: "Erro ao adicionar {{resource}}",
  db_error_adding_item:
    "Erro do banco de dados ao adicionar item ao(a) {{resource}}",
  db_error_deleting_item:
    "Erro do banco de dados ao remover item do(a) {{resource}}",
  db_error_updating_item:
    "Erro do banco de dados ao atualizar item do(a) {{resource}}",
  db_error_getting_items:
    "Erro do banco de dados ao buscar itens do(a) {{resource}}",
  db_error_cleaning: "Erro do banco de dados ao limpar o(a) {{resource}}",
  db_error_update_token: "Erro ao atualizar token de recuperacao",
  db_error_update_password: "Erro ao atualizar senha",
  error_adding_items_to_order: "Erro ao adicionar itens do carrinho ao pedido",
  missing_api_key: "O header x-api-key e obrigatorio",
  invalid_api_key: "Chave de API invalida ou inativa",
  missing_api_secret: "O header x-api-secret e obrigatorio para esta operacao",
  invalid_api_secret: "Segredo de API invalido",
  token_tenant_mismatch: "O token nao pertence a este inquilino",
  missing_idempotency_key:
    "O header Idempotency-Key e obrigatorio para esta operacao",
  invalid_order_status:
    "Pedido esta no status '{{current}}' e nao pode transicionar para '{{target}}'",
  insufficient_stock:
    "Estoque insuficiente para o produto '{{product}}': solicitado {{requested}}, disponivel {{available}}",
  stock_exceeded_cart:
    "Nao e possivel adicionar {{requested}} de '{{product}}' ao carrinho, apenas {{available}} em estoque",
  invalid_webhook_signature: "Assinatura de webhook invalida",
  tenant_not_found_for_subscription:
    "Nenhum inquilino encontrado para a assinatura {{subscription_id}}",
} as const;
