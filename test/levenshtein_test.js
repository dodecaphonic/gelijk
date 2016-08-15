const assert = require("assert");
const jsc = require("jsverify");

const levenshtein = require("../src/gelijk/levenshtein");
const naiveLevenshtein = require("./helpers/levenshtein");

const suite = (distance) => {
  return () => {
    it("defaults to the other String's length if either String is empty", () => {
      assert(distance("", "flag") === 4);
      assert(distance("gloat", "") === 5);
    });

    jsc.property("is zero when both Strings are equal",
                 "string",
                 (word) => distance(word, word) === 0);

    jsc.property("is the same even if you change the argument order",
                 "string", "string",
                 (a, b) => distance(a, b) === distance(b, a));

    jsc.property("the distance between two Strings is no greater than the sum of their distances from a third string",
                 "nestring", "nestring", "nestring",
                 (a, b, c) => distance(a, b) <= distance(a, c) + distance(b, c));

    it("is the edit distance between both Strings when they're different", () => {
      assert(distance("quota", "quote") === 1);
      assert(distance("cling", "bring") === 2);
      assert(distance("clue", "recluse") === 3);
      assert(distance("wight", "recluse") === 7);
    });

    jsc.property("it is always at least the length difference of the Strings",
                 "string", "string",
                 (a, b) => distance(a, b) >= Math.abs(a.length - b.length));
  };
};

describe("The distance between two Strings", () => {
  describe("determined using the recursive Levenshtein implementation",
           suite(naiveLevenshtein));

  describe("determined using dynamic programming", suite(levenshtein));

  jsc.property("is consistent between the naive and the fast implementations",
               "string", "string",
               (a, b) => levenshtein(a, b) === naiveLevenshtein(a, b));
});
