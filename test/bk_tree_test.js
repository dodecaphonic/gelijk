const assert = require("assert");
const jsc = require("jsverify");
const R = require("ramda");

const T = require("../src/gelijk/bk_tree");
const areSimilar = require("./helpers/similar");
const order = require("./helpers/order");
const searchSimilarInSet = require("./helpers/search_similar");

const allSimilar = R.curry((ref, words, threshold) => (
  R.filter((word) => areSimilar(ref, word, threshold), words)
));

const treeArbitrary = jsc.nearray(jsc.nestring)
        .smap(T.createTreeFromSet, T.allWords);

describe("A Burkhard-Keller Tree", () => {
  jsc.property("keeps every word that's inserted", treeArbitrary, "nearray nestring", (tree, words) => {
    const originalWords = T.allWords(tree);
    const updatedTree = R.reduce(T.addWord, tree, words);
    const expectedSet = R.uniq(R.map(R.toLower, originalWords.concat(words)));
    const addedWords = T.allWords(updatedTree);

    return R.equals(order(expectedSet), order(addedWords));
  });

  jsc.property("yields the same results as the brute-force approach", treeArbitrary, "nestring", (tree, refWord) => {
    const word = refWord.toLowerCase();
    const set = T.allWords(tree);
    const search = R.compose(order, (t) => T.searchWords(tree, t, word));
    const sim = R.compose(order, allSimilar(word, set));

    return R.equals(sim(1), search(1)) &&
      R.equals(sim(2), search(2)) &&
      R.equals(sim(10), search(10)) &&
      R.equals([], search(0));
  });

  jsc.property("doesn't insert the same word twice", "nearray nestring", (set) => {
    const tree = T.createTreeFromSet(set.concat(set));
    return R.equals(order(R.uniq(R.map(R.toLower, set))), order(T.allWords(tree)));
  });
});
