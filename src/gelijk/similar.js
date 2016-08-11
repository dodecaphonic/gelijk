const { levenshtein } = require("./levenshtein");

module.exports = (wordA, wordB, threshold) => {
  if (Math.abs(wordA.length - wordB.length) > threshold) {
    return false;
  }

  return levenshtein(wordA, wordB) <= threshold;
};
