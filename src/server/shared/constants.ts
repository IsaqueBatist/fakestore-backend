export const CACHE_TTL = {
  ONE_HOUR: 3600,
  ONE_WEEK: 604800,
} as const;

export const BCRYPT_SALT_ROUNDS = 12;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 7,
} as const;
