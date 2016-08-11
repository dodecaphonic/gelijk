const { dropLast, isEmpty, last, min, range } = require("ramda");

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
  if (isEmpty(wordA)) return wordB.length;
  if (isEmpty(wordB)) return wordA.length;

  const cost = last(wordA) === last(wordB) ? 0 : 1;

  return min(naiveLevenshtein(exceptLastChar(wordA), wordB) + 1,
             min(naiveLevenshtein(wordA, exceptLastChar(wordB)) + 1,
                 naiveLevenshtein(exceptLastChar(wordA), exceptLastChar(wordB)) + cost));
};

/**
 * Determines the Levenshtein distance between two words using the
 * fast, memory-efficient algorithm described by Sten Hjelmqvist
 * (http://www.codeproject.com/Articles/13525/Fast-memory-efficient-Levenshtein-algorithm).
 *
 * @param {string} wordA - the first word
 * @param {string} wordB - the second word
 * @return {number} the edit distance between both words
 */
const levenshtein = (wordA, wordB) => {
  if (wordA === wordB) return 0;
  if (isEmpty(wordA)) return wordB.length;
  if (isEmpty(wordB)) return wordA.length;

  const distA = range(0, wordB.length + 1);
  const distB = [];

  for (let i = 0; i < wordA.length; i++) {
    distB[0] = i + 1;

    for (let j = 0; j < wordB.length; j++) {
      const cost = wordA[i] === wordB[j] ? 0 : 1;
      distB[j + 1] = min(distB[j] + 1,
                         min(distA[j + 1] + 1, distA[j] + cost));
    }

    for (let j = 0; j < distA.length; j++) {
      distA[j] = distB[j];
    }
  }

  return distB[wordB.length];
};

module.exports = {
  naiveLevenshtein,
  levenshtein
};
