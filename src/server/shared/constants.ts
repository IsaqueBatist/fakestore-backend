export const CACHE_TTL = {
  ONE_HOUR: 3600,
  ONE_WEEK: 604800,
} as const;

export const BCRYPT_SALT_ROUNDS = 12;

export const PAGINATION_DEFAULTS = {
  PAGE: 1,
  LIMIT: 7,
} as const;

export const PLAN_CONFIG: Record<string, { rate_limit: number }> = {
  sandbox: { rate_limit: 2 },
  basic: { rate_limit: 10 },
  agency: { rate_limit: 50 },
} as const;

export const TRIAL_DURATION_DAYS = 14;
export const DEFAULT_GRACE_PERIOD_DAYS = 7;
