import "dotenv/config";
import { knex } from "knex";
import { server } from "./server/server";
import { startLogFlush } from "./server/shared/services/LogFlushService";

const startServer = () => {
  server.listen(process.env.PORT || 3333, () => {
    console.log(`App rodando na porta ${process.env.PORT || 3333} 🐣`);
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
        .catch(console.log);
    })
    .catch(console.log);
} else {
  startServer();
}
