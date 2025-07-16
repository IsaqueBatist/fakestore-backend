import 'dotenv/config';
import { server } from './server/server';
import { Knex } from './server/database/knex';

const startServer = () => {
    server.listen(process.env.PORT || 3333, () => console.log(`App rodando na porta ${process.env.PORT || 3333} 🐣`));
}


if (process.env.IS_LOCALHOST != 'true') {
    Knex.migrate.latest().then(() => startServer()).catch(console.log)
} else {
    startServer()
}
