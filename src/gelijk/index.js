const fs = require("fs");
const { compose, filter, isEmpty, not } = require("ramda");

const T = require("./bk_tree");

const removeFile = (path) => new Promise((resolve, reject) => {
  fs.unlink(path, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

const appendWord = (path, newWord) => new Promise((resolve, reject) => {
  fs.appendFile(path, `${newWord}\n`, "utf-8", (err) => {
    if (err) {
      reject(err);
    } else {
      resolve(newWord);
    }
  });
});

const loadFromDisk = (storagePath) => {
  if (!fs.existsSync(storagePath)) {
    return null;
  }

  const words = filter(compose(not, isEmpty),
                       fs.readFileSync(storagePath).toString().split("\n"));

  if (isEmpty(words)) {
    return null;
  } else {
    return T.createTreeFromSet(words);
  }
};

/**
 * Creates a new Index, loading stored words from disk if any present.
 *
 * @param {string} storagePath - The path in which the Index's db is stored
 * @return {Object} an Index
 */
const createIndex = (storagePath) => {
  return {
    keywords: loadFromDisk(storagePath),
    storagePath
  };
};

/**
 * Fetches every keyword in the index.
 *
 * @param {Object} index - an Index
 * @return {Array.<string>} a list of keywords
 */
const allKeywords = (index) => {
  if (index.keywords == null) {
    return [];
  }

  return T.allWords(index.keywords);
};

/**
 * Adds a new keyword to the index, storing it both in the in-memory
 * tree and the database.
 *
 * @param {Object} index - an Index
 * @param {string} word - a keyword
 * @return {Promise.<string>} a database IO action
 */
const addKeyword = (index, word) => {
  if (word == null || word === "") {
    return Promise.reject("You must specify a word to add to the keywords");
  }

  let shouldAppend = false;

  if (index.keywords == null) {
    index.keywords = T.createTree(word);
    shouldAppend = true;
  } else {
    shouldAppend = T.searchWords(index.keywords, 0, word).length === 0;

    index.keywords = T.addWord(index.keywords, word);
  }

  return shouldAppend ? appendWord(index.storagePath, word) : Promise.resolve(word);
};

/**
 * Searches the index for keywords within _threshold_ distance of
 * another word.
 *
 * @param {Object} index - an Index
 * @param {string} word - a reference word
 * @param {number} threshold - a threshold
 * @return {Array.<string>} words within _threshold_ of _word_
 */
const searchKeywords = (index, word, threshold) => {
  if (index.keywords == null) {
    return Promise.resolve([]);
  } else if (word == null || word === "") {
    return Promise.reject("You must specify a word to search the keywords");
  } else {
    const t = threshold != null ? parseInt(threshold) : 3;

    return Promise.resolve(T.searchWords(index.keywords, t, word));
  }
};

/**
 * Clears the index, truncating the database.
 *
 * @param {Object} index - an index
 * @return {Promise.<Object>} a database IO action return the updated index
 */
const clearKeywords = (index) => removeFile(index.storagePath).then(() => {
  index.keywords = null;

  return index;
});

module.exports = {
  createIndex,
  allKeywords,
  addKeyword,
  searchKeywords,
  clearKeywords
};
