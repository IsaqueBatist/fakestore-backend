export const validation = {
  mixed: {
    required: "This field is required",
    notType: "Invalid format",
    defined: "This field must have a defined value",
    oneOf: "Must be one of the following values: {{values}}",
    notOneOf: "Must not be one of the following values: {{values}}",
  },
  string: {
    lowercase: "Must be lowercase",
    uppercase: "Must be uppercase",
    url: "Must be a valid URL",
    max: "Must have at most {{max}} characters",
    min: "Must have at least {{min}} characters",
    email: "Invalid email format",
    length: "Must have exactly {{length}} characters",
    uuid: "Must be a valid UUID",
    trim: "Must not have leading or trailing spaces",
    matches: "Must match the pattern: {{regex}}",
  },
  number: {
    min: "Must be at least {{min}}",
    max: "Must be at most {{max}}",
    integer: "Must be an integer",
    lessThan: "Must be less than {{less}}",
    moreThan: "Must be greater than {{more}}",
    positive: "Must be a positive number",
    negative: "Must be a negative number",
  },
  date: {
    min: "Must be later than {{min}}",
    max: "Must be earlier than {{max}}",
  },
  array: {
    min: "Must have at least {{min}} items",
    max: "Must have at most {{max}} items",
    length: "Must have exactly {{length}} items",
  },
  object: {
    noUnknown: "Must have a defined value",
  },
} as const;
