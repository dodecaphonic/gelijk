const R = require("ramda");

const { levenshtein } = require("./levenshtein");

const children_ = R.lensProp("children");

const create = (word) => {
  return {
    word: word.toLowerCase(),
    children: {}
  };
};

const add = (root, word) => {
  const normalizedWord = word.toLowerCase();

  let node = root;
  let dist = levenshtein(node.word, normalizedWord);

  while (contains(node, dist)) {
    if (dist === 0) {
      return node;
    }

    node = node.children[dist];
    dist = levenshtein(node.word, normalizedWord);
  }

  return addChild(node, normalizedWord, dist);
};

const addChild = (node, word, dist) => (
  R.set(children_,
        R.merge({ [dist]: create(word) }, node.children),
        node)
);

const contains = (node, edgeDist) => R.has(edgeDist, node);

const second = R.view(R.lensIndex(1));

const search = (tree, threshold, word) => {
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
  create,
  add,
  search
};
