import fs from "fs";
import axios from "axios";

fs.readFile("client/events.json", "utf8", async (err, data) => {
  if (err) {
    console.log("File read failed:", err);
    return;
  }

  const events = JSON.parse(data);

  try {
    const res = await Promise.all(
      events.map((event) => {
        return axios.post(
          "http://localhost:8000/liveEvent",
          { event: event },
          {
            headers: {
              Authorization: "secret",
              "Content-Type": "application/json",
            },
          }
        );
      })
    );
  } catch (e) {
    console.error("error while live event", e);
  }
});
