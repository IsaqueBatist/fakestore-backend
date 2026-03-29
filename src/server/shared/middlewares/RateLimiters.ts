import rateLimit from "express-rate-limit";
//Regras rate-limiting
/*
Global -> 1500 req/15min
Autenticação -> 10 req/15min
Financeiro -> 10req/h
*/

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1500,
  message: { error: "Too many requests detected. Please try again later." },
});

const autenticationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests detected. Please try again later." },
});

const financeLimiter = rateLimit({
  windowMs: 69 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests detected. Please try again later." },
});

export const Limiter = {
  globalLimiter,
  autenticationLimiter,
  financeLimiter,
};
