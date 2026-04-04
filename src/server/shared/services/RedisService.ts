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
    const data = await this.redis.get(key);
    if (!data) return null;
    return JSON.parse(data) as T;
  }

  // A tipagem 'unknown' é preferível a 'any' por forçar rigor na serialização
  public async set(
    key: string,
    value: unknown,
    ttlSeconds: number = 3600,
  ): Promise<void> {
    await this.redis.set(key, JSON.stringify(value), "EX", ttlSeconds);
  }

  public async invalidate(key: string): Promise<void> {
    await this.redis.del(key);
  }

  // Substitui o método invalidatePattern. Utiliza SCAN para evitar bloqueio da thread primária.
  public async invalidatePattern(pattern: string): Promise<void> {
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
}

export const RedisService = new RedisCache();
