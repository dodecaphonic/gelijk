const { dropLast, isEmpty, last, min } = require("ramda");

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
const levenshtein = naiveLevenshtein;

module.exports = {
  naiveLevenshtein,
  levenshtein
};
