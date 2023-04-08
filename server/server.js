import express from "express";
import fs from "fs";
import bodyParser from "body-parser";
import getPool from "../dbDetails.js";

const pool = getPool();

const app = express();
const port = 8000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.raw());
app.use(bodyParser.text());

app.post("/liveEvent", (req, res) => {
  let header = req.headers.authorization;
  if (header !== "secret") {
    res.status(401);
    res.send("You are not authorozied to do this action");
  }

  const data = JSON.stringify(req.body.event);

  fs.appendFileSync("./liveEvent.txt", data);
  res.status(200);
  res.send("The action end successfully");
});

app.get("/userEvents/:userid", (req, res) => {
  const userId = req.params.userid;

  try {
    pool.query(
      "SELECT * FROM users_revenue WHERE user_id=$1",
      [userId],
      (error, results) => {
        if (error) {
          throw error;
        }

        if (!results.rows.length) {
          res.status(404).json([]);
        }
        res.status(200).json(results.rows);
      }
    );
  } catch (e) {
    console.error(e);
    res.status(400).json([]);
  }
});

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
