const R = require("ramda");

const { levenshtein } = require("./levenshtein");

const children_ = R.lensProp("children");

const createTree = (word) => {
  return {
    word: word.toLowerCase(),
    children: {}
  };
};

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

const allWords = (tree) => {
  const buildList = (words, node) => {
    if (isLeaf(node)) {
      return words.concat(node.word);
    } else {
      return R.reduce(buildList, words.concat(node.word),
                      R.values(node.children));
    }
  };

  return buildList([], tree);
};

const second = R.view(R.lensIndex(1));

const searchWords = (tree, threshold, word) => {
  const normalizedWord = word.toLowerCase();

  const go = (found, node) => {
    const dist = levenshtein(node.word, normalizedWord);
    const updated = dist <= threshold ? found.concat(node.word) : found;

    if (isLeaf(node)) {
      return updated;
    } else {
      const minDist = dist - threshold;
      const maxDist = dist + threshold;
      const findChildren = ([d, n_]) => d >= minDist && d <= maxDist;

      const childrenWithinThreshold = R.compose(R.map(second),
                                                R.filter(findChildren),
                                                R.toPairs,
                                                R.view(children_))(node);

      return R.reduce(go, updated, childrenWithinThreshold);
    }
  };

  return go([], tree);
};

const isLeaf = (node) => node.children.size === 0;

module.exports = {
  allWords,
  createTree,
  addWord,
  searchWords
};
