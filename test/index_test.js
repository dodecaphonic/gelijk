const fs = require("fs");
const tempfile = require("tempfile");
const { equals, filter } = require("ramda");
const assert = require("assert");

const I = require("../src/gelijk/index");
const order = require("./helpers/order");

const addWordsToFile = (path, words) => {
  words.forEach((word) => {
    fs.appendFileSync(path, `${word}\n`, "utf-8");
  });
};

const fileContents = (path) => fs.readFileSync(path).toString().split("\n");
const fileContains = (path, word) => filter(equals(word), fileContents(path));

describe("A Keyword index", () => {
  let index;
  let dbFile;

  const words = ["work", "wore", "core", "cork", "more", "ore", "or"];

  beforeEach(() => {
    dbFile = tempfile(".db");
    addWordsToFile(dbFile, words);

    index = I.createIndex(dbFile);
  });

  afterEach(() => {
    I.clearKeywords(index);
  });

  it("loads keywords from disk", () => (
    I.allKeywords(index).then((storedWords) => {
      assert(equals(order(words), order(storedWords)));
    })
  ));

  it("adds new keywords to the file", () => {
    I.addKeyword(index, "magnanimous").then(() => {
      assert(fileContains(dbFile, "magnanimous"));
    });
  });

  it("only adds keywords once", () => {
    const word = "repetition";

    return I.addKeyword(index, word)
      .then(() => I.addKeyword(index, word))
      .then(() => I.addKeyword(index, word))
      .then(() => {
        assert(filter(equals(word), fileContents(dbFile)).length == 1);
      });
  });

  it("allows one to search for keywords", () => (
    I.searchKeywords(index, "work", 1)
      .then((found) => {
        assert(order(found), order(["work", "wore", "cork", "ore"]));
      })
  ));
});
