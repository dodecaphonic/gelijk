const { isEmpty } = require("ramda");
const { levenshtein } = require("./levenshtein");

module.exports = (wordA, wordB, threshold) => {
  if (wordA === wordB) {
    return true;
  } else if (isEmpty(wordA) || isEmpty(wordB)) {
    return false;
  } else {
    return levenshtein(wordA, wordB) <= threshold;
  }
};
