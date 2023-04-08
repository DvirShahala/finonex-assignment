const fs = require("fs");

const Pool = require("pg").Pool;

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "postgres",
  port: 5432,
});

fs.readFile(
  "dataProcessor/dataProcessorEvents.json",
  "utf8",
  async (err, data) => {
    if (err) {
      console.log("File read failed:", err);
      return;
    }

    const events = JSON.parse(data);
    const usersRevenueMap = new Map();

    events.forEach((event) => {
      if (!usersRevenueMap.get(event.userId)) {
        const revenue = calculateRevenue(event);
        usersRevenueMap.set(event.userId, revenue);
      } else {
        const currRevenue = usersRevenueMap.get(event.userId);
        const revenue = calculateRevenue(event);
        usersRevenueMap.set(event.userId, currRevenue + revenue);
      }
    });

    usersRevenueMap.forEach(async (revenue, userId) => {
      const resFromDb = await selectUsersRevenue(userId);
      if (resFromDb) {
        const newRevenue = resFromDb.revenue + revenue;
        pool.query(
          `UPDATE public.users_revenue SET revenue=${newRevenue} WHERE user_id='${userId}'`
        );
      } else {
        pool.query(
          `INSERT INTO public.users_revenue(user_id, revenue) VALUES ('${userId}', ${revenue})`
        );
      }
    });
  }
);

const calculateRevenue = (event) => {
  if (event.name === "add_revenue") return event.value;
  return -1 * event.value;
};

const selectUsersRevenue = async (userId) => {
  try {
    const res = await pool.query(
      `SELECT * FROM users_revenue WHERE user_id='${userId}'`
    );
    return res.rows[0];
  } catch (err) {
    return err.stack;
  }
};
