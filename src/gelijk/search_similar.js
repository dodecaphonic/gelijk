const R = require("ramda");

const areSimilar = require("./similar");

module.exports = (wordSet, threshold, word) => (
  R.filter((w) => areSimilar(word, w, threshold), wordSet)
);
