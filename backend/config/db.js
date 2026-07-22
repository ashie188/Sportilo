import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

dotenv.config();


const pool = new Pool({
  user: process.env.Postgres_user,
  host: process.env.Postgres_host,
  database: process.env.Postgres_database,
  password: process.env.Postgres_password,
  port: process.env.Postgres_port,
});

pool.connect()
  .then(() => console.log("PostgreSQL Connected ✅"))
  .catch(err => console.log("DB Connection Error ❌", err));

export default pool;