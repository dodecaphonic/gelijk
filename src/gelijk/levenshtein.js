const { dropLast, isEmpty, last, min, range } = require("ramda");

// String -> String
const exceptLastChar = dropLast(1);

// String -> String -> Number
const naiveLevenshtein = (wordA, wordB) => {
  if (wordA === wordB) return 0;
  if (isEmpty(wordA)) return wordB.length;
  if (isEmpty(wordB)) return wordA.length;

  const cost = last(wordA) === last(wordB) ? 0 : 1;

  return min(naiveLevenshtein(exceptLastChar(wordA), wordB) + 1,
             min(naiveLevenshtein(wordA, exceptLastChar(wordB)) + 1,
                 naiveLevenshtein(exceptLastChar(wordA), exceptLastChar(wordB)) + cost));
};

// String -> String -> Number
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
