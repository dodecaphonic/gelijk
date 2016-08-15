const process = require("process");

const createServer = require("./gelijk/app");

const port = process.env.PORT || 8128;

createServer({
  port,
  afterStart: () => {
    console.log(`Gelijk running on port ${port}`);
  }
});
