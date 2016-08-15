const process = require("process");

const createServer = require("./gelijk/app");

createServer({ port: process.env.PORT || 8128 });
