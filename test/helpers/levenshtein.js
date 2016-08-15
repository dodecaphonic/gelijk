const { dropLast, last, range } = require("ramda");

const exceptLastChar = dropLast(1);

/**
 * Determines the Levenshtein distance between two words
 * recursively. This is implemented as a reference point for the more
 * sophisticated version below.
 *
 * @param {string} wordA - the first word
 * @param {string} wordB - the second word
 * @return {number} the edit distance between both words
 */
const naiveLevenshtein = (wordA, wordB) => {
  if (wordA === wordB) return 0;
  if (wordA === "") return wordB.length;
  if (wordB === "") return wordA.length;

  const cost = last(wordA) === last(wordB) ? 0 : 1;

  return Math.min(naiveLevenshtein(exceptLastChar(wordA), wordB) + 1,
                  naiveLevenshtein(wordA, exceptLastChar(wordB)) + 1,
                  naiveLevenshtein(exceptLastChar(wordA), exceptLastChar(wordB)) + cost);
};

module.exports = naiveLevenshtein;
