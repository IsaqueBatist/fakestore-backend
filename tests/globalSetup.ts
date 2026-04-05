import { Knex } from "../src/server/database/knex";
import { EtableNames } from "../src/server/database/ETableNames";
import { passwordCrypto } from "../src/server/shared/services/PasswordCrypto";

export default async function globalSetup() {
  // Drop all FK constraints before rollback to avoid ordering issues with MSSQL
  await Knex.raw(`
    DECLARE @sql NVARCHAR(MAX) = '';
    SELECT @sql += 'ALTER TABLE ' + QUOTENAME(s.name) + '.' + QUOTENAME(t.name)
      + ' DROP CONSTRAINT ' + QUOTENAME(f.name) + ';'
    FROM sys.foreign_keys f
    JOIN sys.tables t ON f.parent_object_id = t.object_id
    JOIN sys.schemas s ON t.schema_id = s.schema_id;
    EXEC sp_executesql @sql;
  `);

  await Knex.migrate.forceFreeMigrationsLock();
  await Knex.migrate.rollback(undefined, true);
  await Knex.migrate.latest();
  await Knex.seed.run();

  // Create admin user directly in DB (no HTTP server needed)
  const hashedPassword = await passwordCrypto.hashPassword("adminSenha123");
  await Knex(EtableNames.user).insert({
    name: "Admin",
    email: "admin@exemple.com",
    password_hash: hashedPassword,
    role: "admin",
  });

  // Create cart for admin
  const [admin] = await Knex(EtableNames.user)
    .select("id_user")
    .where("email", "admin@exemple.com");
  await Knex(EtableNames.cart).insert({ user_id: admin.id_user });

  await Knex.destroy();
}
