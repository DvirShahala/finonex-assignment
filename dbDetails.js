import PG from "pg";

const Pool = PG.Pool;

let pool;
const getPool = () => {
  if (!pool) {
    return new Pool({
      user: "postgres",
      host: "localhost",
      database: "postgres",
      password: "postgres",
      port: 5432,
    });
  }
  return pool;
};

export default getPool;
