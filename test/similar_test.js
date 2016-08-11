const assert = require("assert");
const jsc = require("jsverify");

const areSimilar = require("../src/gelijk/similar");

describe("the similarity between two words", () => {
  it("is inexistent if the size difference between them is larger than threshold", () => {
    assert(!areSimilar("gala", "gallantry", 3));
    assert(!areSimilar("gala", "gallantry", 4));
  });

  it("is inexistent if the edit distance is larger than the threshold", () => {
    assert(!areSimilar("gala", "home", 3));
    assert(!areSimilar("cling", "quite", 3));
  });

  it("can be attested if the edit distance is at most as large as the threshold", () => {
    assert(areSimilar("gala", "gale", 3));
    assert(areSimilar("gala", "male", 3));
    assert(areSimilar("morgue", "corgi", 3));
    assert(areSimilar("a", "aces", 3));
  });

  it("cannot be attested if either word is empty", () => {
    assert(!areSimilar("", "loneliness", 30));
    assert(!areSimilar("loneliness", "", 42));
  });

  it("exists if both words are equal", () => {
    assert(areSimilar("word", "word", 0));
    assert(areSimilar("", "", 0));
  });
});
