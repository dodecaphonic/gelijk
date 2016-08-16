/**
 * An Index unifies storage and usages of the BK tree under a single
 * interface. It uses a flat utf-8 text file as a storage mechanism,
 * using simple append operations as a way of growing it.
 *
 * Since it is expected that Index is used in mutable contexts only
 * (i.e. a User wants both the fast searches AND the storage) and
 * there's no nice way to bubble that up and down using a StateT from
 * Express.js to the filesystem and back, a Promise is returned
 * whenever a mutation happens, to signal both the potential async
 * operation and the fact it changes the world around it.
 *
 * @example
 * const I = require("index");
 * const index = I.createIndex("/path/to/storage.db");
 * I.addKeyword(index, "functional").then((w) => ...) // => Promise
 * I.addKeyword(index, "programming").then((w) => ...) // => Promise
 * I.searchWords(index, "fun", 10) // => Promise
 * I.allKeywords() // => Promise
 */
const fs = require("fs");
const { TaskQueue } = require("cwait");
const { compose, filter, isEmpty, not } = require("ramda");

const T = require("./bk_tree");

const promisify = (fn) => (...args) => new Promise((resolve, reject) => {
  fn(...args, (err) => {
    if (err) {
      reject(err);
    } else {
      resolve();
    }
  });
});

const removeFile = promisify(fs.unlink);
const appendFile = promisify(fs.appendFile);

const appendWord = (path, newWord) => (
  appendFile(path, `${newWord}\n`, "utf-8")
    .then(() => newWord)
);

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

const queue = new TaskQueue(Promise, 50);

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
 * @return {Promise.<Array.<string>>} a list of keywords
 */
const allKeywords = (index) => {
  if (index.keywords == null) {
    return Promise.resolve([]);
  }

  return Promise.resolve(T.allWords(index.keywords));
};

/**
 * Adds a new keyword to the index, storing it both in the in-memory
 * tree and the database.
 *
 * @param {Object} index - an Index
 * @param {string} word - a keyword
 * @return {Promise.<string>} a database IO action
 */
const addKeyword = queue.wrap((index, word) => {
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
});

/**
 * Searches the index for keywords within _threshold_ distance of
 * another word.
 *
 * @param {Object} index - an Index
 * @param {string} word - a reference word
 * @param {number} threshold - a threshold
 * @return {Promise.<Array.<string>>} words within _threshold_ of _word_
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
const clearKeywords = queue.wrap((index) => (
  removeFile(index.storagePath).then(() => {
    index.keywords = null;
    return index;
  })
));

module.exports = {
  createIndex,
  allKeywords,
  addKeyword,
  searchKeywords,
  clearKeywords
};
