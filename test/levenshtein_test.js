const assert = require("assert");
const jsc = require("jsverify");
const Lev = require("../src/gelijk/levenshtein");

const suite = (distance) => {
  return () => {
    it("defaults to the other String's length if either String is empty", () => {
      assert(distance("", "flag") === 4);
      assert(distance("drag", "") === 4);
    });

    jsc.property("is always 0 when String is compared to itself", "string", (word) => (
      distance(word, word) === 0
    ));

    it("is the edit distance between both Strings when they're different", () => {
      assert(distance("quota", "quote") === 1);
      assert(distance("cling", "bring") === 2);
      assert(distance("clue", "recluse") === 3);
    });
  };
};

describe("The distance between two Strings", () => {
  describe("calculated using a naive, recursive, Levenshtein implementation",
           suite(Lev.naiveLevenshtein));

  describe("calculated using an implementation of Wagner-Fischer", suite(Lev.levenshtein));

  jsc.property("faster implementation is consistent with the naive implementation", "string", "string", (a, b) => (
    Lev.levenshtein(a, b) === Lev.naiveLevenshtein(a, b)
  ));
});
