const assert = require("assert");
const jsc = require("jsverify");
const R = require("ramda");

const T = require("../src/gelijk/bk_tree");
const searchSimilarInSet = require("../src/gelijk/search_similar");

const createTree = (set) => (
  R.reduce((tree, word) => T.add(tree, word),
           T.create(set[0]), R.drop(1, set))
);

const order = R.sort((a, b) => a < b);

describe("A Burkhard-Teller Tree", () => {
  const set = ["word", "wordy", "wordsmith", "reword"];
  const word = "cord";

  it("searching words matching specified criteria", () => {
    const tree = createTree(set);

    assert(R.equals(["word"], order(T.search(tree, 1, word))));
    assert(R.equals(order(["word", "wordy"]), order(T.search(tree, 2, word))));
    assert(R.equals(order(set), order(T.search(tree, 10, word))));
    assert(R.equals([], T.search(tree, 0, word)));
  });
});
