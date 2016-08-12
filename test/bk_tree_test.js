const assert = require("assert");
const jsc = require("jsverify");
const R = require("ramda");

const T = require("../src/gelijk/bk_tree");
const areSimilar = require("../src/gelijk/similar");
const searchSimilarInSet = require("../src/gelijk/search_similar");

const createTree = (set) => (
  R.reduce((tree, word) => T.addWord(tree, word),
           T.createTree(set[0]), R.drop(1, set))
);

const order = R.sort((a, b) => a > b);

const allSimilar = R.curry((ref, words, threshold) => (
  R.filter((word) => areSimilar(ref, word, threshold), words)
));

describe("A Burkhard-Teller Tree", () => {
  const set = ["word", "wore", "cord", "wordy", "wordsmith", "reword"];
  const word = "worc";

  it("searching words matching specified criteria", () => {
    const tree = createTree(set);
    const search = R.compose(order, (t) => T.searchWords(tree, t, word));
    const sim = R.compose(order, allSimilar(word, set));

    assert(R.equals(sim(1), search(1)));
    assert(R.equals(sim(2), search(2)));
    assert(R.equals(sim(10), search(10)));
    assert(R.equals([], search(0)));
  });

  it("keeps every unique value that is inserted", () => {
    const tree = createTree(set.concat(set));

    assert(R.equals(order(set), order(T.allWords(tree))),
          `expected (${order(set).join(", ")}), was (${order(T.allWords(tree)).join(", ")})`);
  });
});
