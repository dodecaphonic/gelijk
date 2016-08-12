/**
 * A Burkhard-Teller tree is a data structure that allows for fast
 * searching of proximate strings, using the edit distance between its
 * nodes as the branching criterion. A best-case search should take
 * O(lg n) time, but lower thresholds (that is, maximum edit
 * distances) can yield very short tree hops before finding all
 * results. For more on that, see
 * https://github.com/vy/bk-tree#performance.
 *
 * The tree is implemented as a purely functional datastructure, which
 * means every change to its contents yields a new tree. It doesn't,
 * however, copy every single value -- it shares most of the structure
 * and changes only the affected node.
 *
 * @example
 * const tree = createTree("word");
 * const updatedTreeA = addWord(tree, "work");
 * const updatedTreeB = addWord(updatedTreeA, "core");
 * searchWords(updatedTreeB, 2, "wo") // => ["word", work"]
 * searchWords(updatedTreeB, 1, "more") // => ["core"]
 */
const R = require("ramda");

const { levenshtein } = require("./levenshtein");


const children_ = R.lensProp("children");

/**
 * Creates a new BK Tree.
 *
 * @param {string} word - A word
 * @return {Object} the tree node
 */
const createTree = (word) => {
  return {
    word: word.toLowerCase(),
    children: {}
  };
};

/**
 * Adds a word to the BK Tree.
 *
 * @param {Object} root - The tree root
 * @param {string} word - The new word
 * @return {Object} the updated tree
 */
const addWord = (root, word) => {
  const normalizedWord = word.toLowerCase();

  const go = (node) => {
    let dist = levenshtein(node.word, normalizedWord);

    if (dist === 0) {
      return node;
    }

    if (R.has(dist, node.children)) {
      const child = node.children[dist];
      const updated = R.merge(node.children, { [dist]: go(child) });

      return R.set(children_, updated, node);
    } else {
      return addChild(node, normalizedWord, dist);
    }
  };

  return go(root);
};

const addChild = (node, word, dist) => (
  R.set(children_,
        R.merge({ [dist]: createTree(word) }, node.children),
        node)
);

/**
 * Builds a list of every word that's in the tree.
 *
 * @param {Object} root - the tree root
 * @return {Array.<string>} an array of words
 */
const allWords = (root) => {
  const buildList = (words, node) => {
    if (isLeaf(node)) {
      return words.concat(node.word);
    } else {
      return R.reduce(buildList, words.concat(node.word),
                      R.values(node.children));
    }
  };

  return buildList([], root);
};

const second = R.view(R.lensIndex(1));

/**
 * Searches for words matching a reference word, with the expectation
 * that they are at most _threshold_ edits away from it.
 *
 * @param {Object} tree - the tree root
 * @param {number} threshold - the maximum edit distance
 * @param {string} word - the word one is searching for
 * @return {Array.<string>} all words matching the criteria
 */
const searchWords = R.curry((tree, threshold, word) => {
  const normalizedWord = word.toLowerCase();
  const found = [];

  const reducer = (node) => {
    const dist = levenshtein(node.word, normalizedWord);

    if (dist <= threshold) {
      found.push(node.word);
    }

    const minDist = dist - threshold;
    const maxDist = dist + threshold;

    for (let d = minDist; d <= maxDist; d++) {
      if (node.children[d] != null) {
        reducer(node.children[d]);
      }
    }
  };

  reducer(tree);

  return found;
});

const isLeaf = (node) => R.isEmpty(node.children);

module.exports = {
  allWords,
  createTree,
  addWord,
  searchWords
};
