import Redis from "ioredis";

// Nomenclatura Padrão: [domínio/entidade]:[operação/contexto]:[parâmetros_determinísticos]
class RedisCache {
  private redis: Redis;

  constructor() {
    if (!process.env.REDIS_HOST || !process.env.REDIS_PORT) {
      throw new Error(
        "The REDIS_HOST and REDIS_PORT environment variables are required.",
      );
    }
    this.redis = new Redis({
      host: process.env.REDIS_HOST || "127.0.0.1",
      port: Number(process.env.REDIS_PORT) || 6379,
      password: process.env.REDIS_PASSWORD,
      maxRetriesPerRequest: 3,
      retryStrategy(times) {
        if (times > 10) return null;
        return Math.min(times * 200, 3000);
      },
    });

    this.redis.on("connect", () => {
      console.log("Conexão TCP com o Redis estabelecida.");
    });

    this.redis.on("error", (err) => {
      console.error("Falha na comunicação com o Redis:", err);
    });
  }

  // ============================================================================
  // OPERAÇÕES DE CACHE-ASIDE (Strings / JSON) - Alvo: Categorias, Produtos
  // ============================================================================

  public async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(key);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  // A tipagem 'unknown' é preferível a 'any' por forçar rigor na serialização
  public async set(
    key: string,
    value: unknown,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    try {
      await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
    } catch {
      // Cache write failure is non-fatal
    }
  }

  public async invalidate(key: string): Promise<void> {
    try {
      await this.redis.del(key);
    } catch {
      // Cache invalidation failure is non-fatal
    }
  }

  // Substitui o método invalidatePattern. Utiliza SCAN para evitar bloqueio da thread primária.
  public async invalidatePattern(pattern: string): Promise<void> {
    try {
      let cursor = "0";

      do {
        // COUNT 100 instrui o Redis a iterar em lotes moderados, balanceando I/O e bloqueio
        const [nextCursor, keys] = await this.redis.scan(
          cursor,
          "MATCH",
          pattern,
          "COUNT",
          100,
        );
        cursor = nextCursor;

        // O uso de pipeline ou variadic DEL minimiza as viagens de rede (Network Round Trips)
        if (keys.length > 0) {
          await this.redis.del(...keys);
        }
      } while (cursor !== "0");
    } catch {
      // Cache invalidation failure is non-fatal
    }
  }

  // ============================================================================
  // OPERAÇÕES DE ESTADO EFÊMERO (Hashes) - Alvo: Carrinho de Compras
  // Complexidade de tempo O(1) para manipulação de itens individuais
  // ============================================================================

  public async hset(
    key: string,
    field: string,
    value: string | number,
  ): Promise<void> {
    await this.redis.hset(key, field, value);
  }

  public async hgetall(key: string): Promise<Record<string, string>> {
    return await this.redis.hgetall(key);
  }

  public async hdel(key: string, field: string): Promise<void> {
    await this.redis.hdel(key, field);
  }

  public async hget(key: string, field: string): Promise<string | null> {
    return await this.redis.hget(key, field);
  }

  public async expire(key: string, ttlSeconds: number): Promise<void> {
    await this.redis.expire(key, ttlSeconds);
  }

  /**
   * Sliding window rate limit check using sorted sets.
   * Returns the number of requests in the current window.
   */
  public async rateLimitCheck(
    key: string,
    now: number,
    windowMs: number,
  ): Promise<number> {
    const pipeline = this.redis.pipeline();
    pipeline.zremrangebyscore(key, 0, now - windowMs);
    pipeline.zadd(key, now, `${now}:${Math.random()}`);
    pipeline.zcard(key);
    pipeline.expire(key, Math.ceil(windowMs / 1000) + 1);

    const results = await pipeline.exec();
    // zcard result is at index 2: [error, count]
    return (results?.[2]?.[1] as number) ?? 0;
  }

  // ============================================================================
  // OPERAÇÕES DE LISTA (Log buffer / filas simples)
  // ============================================================================

  public async lpush(key: string, value: string): Promise<void> {
    try {
      await this.redis.lpush(key, value);
    } catch {
      // Non-fatal
    }
  }

  public async lrange(
    key: string,
    start: number,
    stop: number,
  ): Promise<string[]> {
    try {
      return await this.redis.lrange(key, start, stop);
    } catch {
      return [];
    }
  }

  public async ltrim(key: string, start: number, stop: number): Promise<void> {
    try {
      await this.redis.ltrim(key, start, stop);
    } catch {
      // Non-fatal
    }
  }

  public async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch {
      return 0;
    }
  }

  // ============================================================================
  // OPERAÇÕES ATÔMICAS (Contadores / Rate limit stats)
  // ============================================================================

  public async incr(key: string, ttlSeconds: number): Promise<number> {
    try {
      const count = await this.redis.incr(key);
      if (count === 1) {
        await this.redis.expire(key, ttlSeconds);
      }
      return count;
    } catch {
      return 0;
    }
  }

  public async zcard(key: string): Promise<number> {
    try {
      return await this.redis.zcard(key);
    } catch {
      return 0;
    }
  }

  public async flushall(): Promise<void> {
    await this.redis.flushall();
  }

  public async disconnect(): Promise<void> {
    await this.redis.quit();
  }
}

export const RedisService = new RedisCache();
