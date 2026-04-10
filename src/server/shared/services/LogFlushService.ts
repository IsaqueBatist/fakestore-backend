import { RedisService } from "./RedisService";
import { Knex } from "../../database/knex";
import { EtableNames } from "../../database/ETableNames";

const LOG_QUEUE_KEY = "queue:api_logs";
const BATCH_SIZE = 100;
const FLUSH_INTERVAL_MS = 10_000; // 10 seconds

let flushInterval: ReturnType<typeof setInterval> | null = null;

async function flushLogs(): Promise<void> {
  try {
    const queueLength = await RedisService.llen(LOG_QUEUE_KEY);
    if (queueLength === 0) return;

    const batchCount = Math.min(queueLength, BATCH_SIZE);

    // Atomically read and trim in sequence
    const rawLogs = await RedisService.lrange(
      LOG_QUEUE_KEY,
      -batchCount,
      -1,
    );

    if (rawLogs.length === 0) return;

    // Trim the consumed entries from the list
    await RedisService.ltrim(LOG_QUEUE_KEY, 0, -(batchCount + 1));

    // Parse and batch insert
    const logs = rawLogs
      .map((raw) => {
        try {
          return JSON.parse(raw);
        } catch {
          return null;
        }
      })
      .filter(Boolean);

    if (logs.length > 0) {
      await Knex(EtableNames.api_request_logs).insert(
        logs.map((log: Record<string, unknown>) => ({
          tenant_id: log.tenant_id,
          user_id: log.user_id,
          method: log.method,
          path: log.path,
          status_code: log.status_code,
          duration_ms: log.duration_ms,
          request_body: log.request_body
            ? JSON.stringify(log.request_body)
            : null,
          response_body: log.response_body
            ? JSON.stringify(log.response_body)
            : null,
          ip_address: log.ip_address,
        })),
      );
    }
  } catch (error) {
    console.error("[LogFlush] Failed to flush logs:", error);
  }
}

export function startLogFlush(): void {
  if (flushInterval) return;

  flushInterval = setInterval(flushLogs, FLUSH_INTERVAL_MS);
  console.log(
    `[LogFlush] Started - flushing every ${FLUSH_INTERVAL_MS / 1000}s`,
  );
}

export function stopLogFlush(): void {
  if (flushInterval) {
    clearInterval(flushInterval);
    flushInterval = null;
  }
}
