import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();

const isProduction = process.env.NODE_ENV === "production";

const pool = new Pool(
  isProduction
    ? {
        connectionString: process.env.DATABASE_URL,
        ssl: {
          rejectUnauthorized: false,
        },
      }
    : {
        user: process.env.Postgres_user,
        host: process.env.Postgres_host,
        database: process.env.Postgres_database,
        password: process.env.Postgres_password,
        port: process.env.Postgres_port,
      },
);

pool
  .query("SELECT NOW()")
  .then(() => console.log("PostgreSQL Connected "))
  .catch((err) => console.error("DB Connection Error "));

export default pool;
