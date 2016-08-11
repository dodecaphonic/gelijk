const assert = require("assert");
const jsc = require("jsverify");
const { map } = require("ramda");

const areSimilar = require("../src/gelijk/similar");

const shiftCharsByOne = map((c) => String.fromCharCode(c.charCodeAt(0) + 1));

describe("the similarity between two words", () => {
  jsc.property("is inexistent if the size difference between them is larger than threshold",
               "nestring", "nestring",
               (a, b) => !areSimilar(a, b, Math.abs(b.length - a.length) - 1) || a === b);

  jsc.property("is inexistent if the edit distance is larger than the threshold",
               "nestring",
               (word) => !areSimilar(word, shiftCharsByOne(word), word.length - 1));

  jsc.property("can be attested if the edit distance is at most as large as the threshold",
               "nestring",
               (word) => areSimilar(word, shiftCharsByOne(word), word.length));

  jsc.property("exists if both words are equal",
               "string",
               (word) => areSimilar(word, word, 0));

  it("cannot be attested if either word is empty", () => {
    assert(!areSimilar("", "loneliness", 30));
    assert(!areSimilar("loneliness", "", 42));
  });

  it("is checked with a default threshold of 3 if none is specified", () => {
    assert(areSimilar("word", "code"));
    assert(areSimilar("w", "word"));
  });
});
