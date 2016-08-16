const assert = require("assert");
const request = require("superagent");
const tempfile = require("tempfile");
const { equals, map } = require("ramda");
const fs = require("fs");

const createServer = require("../src/gelijk/app");
const order = require("./helpers/order");

const TEST_PORT = 31932;

const requestHandler = (reject, resolve) => (err, res) => {
  if (err || !res.ok) {
    reject(err);
  } else {
    resolve(JSON.parse(res.text));
  }
};

const buildRequest = (withMethod, { path, payload } = {}) => new Promise((res, rej) => {
  const uri = `http://localhost:${TEST_PORT}/keywords${ path ? path : ""}`;
  const req = withMethod(uri).set("Content-Type", "application/json");

  if (payload) {
    req.send(JSON.stringify(payload));
  }

  req.end(requestHandler(rej, res));
});

const addWord = (word) => buildRequest(request.post, { payload: { word } });
const listWords = () => buildRequest(request.get);
const clearWords = () => buildRequest(request.delete);
const searchWord = (word, threshold) => (
  buildRequest(request.get, { path: "/search", payload: { word, threshold }})
);

describe("the JSON API", () => {
  let app;
  let indexStoragePath;

  const words = ["work", "wore", "core", "cork", "more", "ore", "or"];

  before(() => {
    indexStoragePath = tempfile(".db");

    app = createServer({
      port: TEST_PORT,
      indexStoragePath
    });
  });

  after(() => {
    setTimeout(() => app.close(), 1000);

    if (fs.existsSync(indexStoragePath)) {
      fs.unlinkSync(indexStoragePath);
    }
  });

  it("allows words to be added to the index", () => (
    clearWords().
      then(() => addWord("hiding"))
      .then(({ word, added }) => {
        assert(added);
        assert(word === "hiding");
      })
  ));

  it("lists every word that's been added", () => {
    return clearWords().then(() => (
      Promise
        .all(map(addWord, words))
        .then(listWords)
        .then((fetchedWords) => {
          assert(equals(order(words), order(fetchedWords)));
        })
    ));
  });

  it("allows one to search for words within a certain edit distance of another", () => {
    return clearWords().then(() => (
      Promise
        .all(map(addWord, words))
        .then(() => searchWord("work", 1))
        .then((words) => {
          assert(order(words), order(["work", "wore", "cork"]));
        })
    ));
  });
});
