const assert = require("assert");
const jsc = require("jsverify");
const { equals } = require("ramda");

const searchSimilarInSet = require("../src/gelijk/search_similar");

describe("searching words matching specified criteria", () => {
  it("is affected by the threshold", () => {
    const set = ["word", "wordy", "wordsmith", "reword"];
    const word = "cord";

    assert(equals(["word"], searchSimilarInSet(set, 1, word)));
    assert(equals(["word", "wordy"], searchSimilarInSet(set, 2, word)));
    assert(equals(set, searchSimilarInSet(set, 10, word)));
    assert(equals([], searchSimilarInSet(set, 0, word)));
  });
});
