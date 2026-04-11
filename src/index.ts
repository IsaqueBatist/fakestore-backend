import "dotenv/config";
import { knex } from "knex";
import { server } from "./server/server";
import { startLogFlush } from "./server/shared/services/LogFlushService";
import { logger } from "./server/shared/services/Logger";

const startServer = () => {
  server.listen(process.env.PORT || 3333, () => {
    logger.info({ port: process.env.PORT || 3333 }, "Server started");
    startLogFlush();
  });
};

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
