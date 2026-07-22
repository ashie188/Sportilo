import pool from "../config/db.js";

// create user
export const createUser = async (name, email, password, provider) => {
  const result = await pool.query(
    `INSERT INTO users (name, email, password, provider)
     VALUES ($1, $2, $3, $4)
     RETURNING *`,
    [name, email, password, provider],
  );

  return result.rows[0];
};

// find user
export const findUserByEmail = async (email) => {
  const result = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  return result.rows[0];
};
