const express = require("express");
const { playTest } = require("./scraper");

const app = express();
app.use(express.static("./"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(3000, async () => {
  await playTest("https://expert.chegg.com/auth/login");
  console.log("server started at port 3000");
});
