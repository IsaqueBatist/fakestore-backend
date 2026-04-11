import "dotenv/config";
import http from "http";
import { knex } from "knex";
import { server } from "./server/server";
import { startLogFlush, stopLogFlush } from "./server/shared/services/LogFlushService";
import { logger } from "./server/shared/services/Logger";

let httpServer: http.Server;

const startServer = () => {
  httpServer = server.listen(process.env.PORT || 3333, () => {
    logger.info({ port: process.env.PORT || 3333 }, "Server started");
    startLogFlush();
  });
};

// Graceful shutdown — drain connections, close DB/Redis, flush logs
async function gracefulShutdown(signal: string) {
  logger.info({ signal }, "Shutdown signal received, draining connections...");

  // Stop accepting new connections
  if (httpServer) {
    httpServer.close(() => {
      logger.info("HTTP server closed");
    });
  }

  // Stop log flush interval
  stopLogFlush();

  // Close database connection
  try {
    const { Knex: db } = require("./server/database/knex");
    await db.destroy();
    logger.info("Database connection closed");
  } catch {
    // DB may not be initialized
  }

  // Close Redis connection
  try {
    const { RedisService } = require("./server/shared/services/RedisService");
    await RedisService.disconnect();
    logger.info("Redis connection closed");
  } catch {
    // Redis may not be initialized
  }

  logger.info("Graceful shutdown complete");
  process.exit(0);
}

process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

if (process.env.IS_LOCALHOST != "true") {
  // Migrations usam credenciais admin (DDL: CREATE, ALTER, DROP)
  const adminKnex = knex(
    require("./server/database/knex/Environment")[
      process.env.NODE_ENV || "development"
    ],
  );

  adminKnex.migrate
    .latest()
    .then(() => {
      adminKnex.seed
        .run()
        .then(() => {
          adminKnex.destroy();
          startServer();
        })
        .catch((err: unknown) => logger.error(err, "Seed failed"));
    })
    .catch((err: unknown) => logger.error(err, "Migration failed"));
} else {
  startServer();
}
