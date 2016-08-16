const process = require("process");
const path = require("path");

const createServer = require("./gelijk/app");

const port = process.env.PORT || 8128;

createServer({
  port,
  indexStoragePath: path.join(__dirname, "..", "db", "index.db"),
  afterStart: () => {
    console.log(`Gelijk running on port ${port}`);
  },
  useLog: true
});
