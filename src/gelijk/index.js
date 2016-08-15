const fs = require("fs");
const { compose, filter, isEmpty, not } = require("ramda");

const T = require("./bk_tree");

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

const createIndex = (storagePath) => {
  return {
    keywords: loadFromDisk(storagePath),
    storagePath
  };
};

const allKeywords = (index) => {
  if (index.keywords == null) {
    return [];
  }

  return T.allWords(index.keywords);
};

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

const searchKeywords = (index, { word, threshold }) => {
  if (index.keywords == null) {
    return Promise.resolve([]);
  } else if (word == null || word === "") {
    return Promise.reject("You must specify a word to search the keywords");
  } else {
    const t = threshold != null ? parseInt(threshold) : 3;

    return Promise.resolve(T.searchWords(index.keywords, t, word));
  }
};

const clearKeywords = (index) => {
  index.keywords = null;
};

module.exports = {
  createIndex,
  allKeywords,
  addKeyword,
  searchKeywords,
  clearKeywords
};
