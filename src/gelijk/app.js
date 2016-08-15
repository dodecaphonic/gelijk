const bodyParser = require("body-parser");
const Either = require("data.either");

const T = require("./bk_tree");

/**
 * Creates a new instance of Gelijk.
 *
 * @param {number} options.port - the port to which it will bind
 * @param {function} options.afterStart - a function to call when the
 *   server has started
 * @return {Object} a running instance of Gelijk
 */
const createServer = ({ port, afterStart } = {}) => {
  const app = require("express")();

  let keywords;

  const addNewWord = ({ word }) => {
    if (word == null || word === "") {
      return Either.Left("You must specify a word to add to the keywords");
    }

    if (keywords == null) {
      keywords = T.createTree(word);
    } else {
      keywords = T.addWord(keywords, word);
    }

    return Either.of(word);
  };

  const searchWords = ({ word, threshold }) => {
    if (keywords == null) {
      return Either.of([]);
    } else if (word == null || word === "") {
      return Either.Left("You must specify a word to search the keywords");
    } else {
      const t = threshold != null ? parseInt(threshold) : 3;

      return Either.of(T.searchWords(keywords, t, word));
    }
  };

  const clearKeywords = () => {
    keywords = null;
  };

  const serialize = (res) => (v) => res.send(JSON.stringify(v));
  const wordAdded = (res) => (word) => serialize(res)({ word, added: true });
  const onError = (res) => (err) => res.status(400).send(err);

  app.use(bodyParser.json());

  app.get("/keywords", (req, res) => {
    res.send(JSON.stringify(T.allWords(keywords)));
  });

  app.delete("/keywords", (req, res) => {
    clearKeywords();

    res.send({ cleared: true });
  });

  app.get("/keywords/search", (req, res) => {
    searchWords(req.body).fold(onError(res), serialize(res));
  });

  app.post("/keywords", (req, res) => (
    addNewWord(req.body).fold(onError(res), wordAdded(res))
  ));

  return app.listen(port, (afterStart || (() => {}))());
};

module.exports = createServer;
