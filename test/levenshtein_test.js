const assert = require("assert");
const jsc = require("jsverify");
const Lev = require("../src/gelijk/levenshtein");

describe("The distance between two Strings", () => {
  it("defaults to the other String's length if either String is empty", () => {
    assert(Lev.levenshtein("", "flag") === 4);
    assert(Lev.levenshtein("drag", "") === 4);
  });

  jsc.property("is always 0 when String is compared to itself", "string", (word) => (
    Lev.levenshtein(word, word) === 0
  ));

  it("is the edit distance between both Strings when they're different", () => {
    assert(Lev.levenshtein("quota", "quote") === 1);
    assert(Lev.levenshtein("cling", "bring") === 2);
    assert(Lev.levenshtein("clue", "recluse") === 3);
  });

  jsc.property("faster implementation is consistent with the naive implementation", "string", "string", (a, b) => (
    Lev.levenshtein(a, b) === Lev.naiveLevenshtein(a, b)
  ));
});
