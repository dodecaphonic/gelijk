const { isEmpty } = require("ramda");

const { levenshtein } = require("./levenshtein");

/**
 * Determines if two words are similar, allowing differences of at
 * most _threshold_ characters. It assumes non-empty strings are never
 * similar to empty strings, even if the non-empty string's length is
 * within the threshold.
 *
 * @param {string} wordA - the first word
 * @param {string} wordB - the second word
 * @param {number} threshold - the maximum allowed difference between
 *   words (defaults to 3)
 * @return {boolean} whether the words are similar
 */
module.exports = (wordA, wordB, threshold = 3) => {
  if (wordA === wordB) {
    return true;
  } else if (isEmpty(wordA) || isEmpty(wordB)) {
    return false;
  } else {
    return levenshtein(wordA, wordB) <= threshold;
  }
};
