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
  if (wordA === "") return wordB.length;
  if (wordB === "") return wordA.length;

  const distA = new Array(wordB.length + 1);
  const distB = new Array(wordB.length + 1);

  for (let i = 0; i < distA.length; i++) {
    distA[i] = i;
  }

  for (let i = 0; i < wordA.length; i++) {
    distB[0] = i + 1;

    for (let j = 0; j < wordB.length; j++) {
      const cost = wordA[i] === wordB[j] ? 0 : 1;
      distB[j + 1] = Math.min(distB[j] + 1,
                              Math.min(distA[j + 1] + 1, distA[j] + cost));
    }

    for (let j = 0; j < distA.length; j++) {
      distA[j] = distB[j];
    }
  }

  return distB[wordB.length];
};

module.exports = levenshtein;
