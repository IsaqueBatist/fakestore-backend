export const validation = {
  mixed: {
    required: "Este campo e obrigatorio",
    notType: "Formato digitado e invalido",
    defined: "Este campo precisa ter um valor definido",
    oneOf: "Deve ser um dos seguintes valores: {{values}}",
    notOneOf: "Nao pode ser um dos seguintes valores: {{values}}",
  },
  string: {
    lowercase: "Deve estar em maiusculo",
    uppercase: "Deve estar em minusculo",
    url: "Deve ter um formato de URL valida",
    max: "Deve ter no maximo {{max}} caracteres",
    min: "Deve ter pelo menos {{min}} caracteres",
    email: "Formato de e-mail digitado nao e valido",
    length: "Deve ter exatamente {{length}} caracteres",
    uuid: "Valor digitado nao confere a um UUID valido",
    trim: "Nao deve conter espacos no inicio ou no fim.",
    matches: "O valor deve corresponder ao padrao: {{regex}}",
  },
  number: {
    min: "Deve ser no minimo {{min}}",
    max: "Deve ser no maximo {{max}}",
    integer: "Deve ser um numero inteiro",
    lessThan: "Deve ser menor que {{less}}",
    moreThan: "Deve ser maior que {{more}}",
    positive: "Deve ser um numero positivo",
    negative: "Deve ser um numero negativo",
  },
  date: {
    min: "Deve ser maior que a data {{min}}",
    max: "Deve ser menor que a data {{max}}",
  },
  array: {
    min: "Deve ter no minimo {{min}} itens",
    max: "Deve ter no maximo {{max}} itens",
    length: "Deve conter exatamente {{length}} itens",
  },
  object: {
    noUnknown: "Deve ser passado um valor definido",
  },
} as const;
