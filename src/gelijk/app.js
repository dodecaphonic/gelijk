const bodyParser = require("body-parser");
const { curry } = require("ramda");

const I = require("./index");

/**
 * Creates a new instance of Gelijk.
 *
 * @param {number} options.port - the port to which it will bind
 * @param {function} options.afterStart - a function to call when the
 *   server has started
 * @return {Object} a running instance of Gelijk
 */
const createServer = ({ port, afterStart, indexStoragePath } = {}) => {
  const app = require("express")();

  const serialize = curry((res, v) => res.send(JSON.stringify(v)));
  const wordAdded = curry((res, word) => serialize(res)({ word, added: true }));
  const onError = curry((res, err) => res.status(400).send(err));

  const index = I.createIndex(indexStoragePath);

  app.use(bodyParser.json());

  app.get("/keywords", (req, res) => (
    I.allKeywords(index).then(serialize(res), onError(res))
  ));

  app.delete("/keywords", (req, res) => {
    I.clearKeywords(index)
      .then(() => serialize(res)({ cleared: true }),
            () => serialize(res)({ cleared: false }));
  });

  app.get("/keywords/search", (req, res) => {
    const { word, threshold } = req.body;

    I.searchKeywords(index, word, threshold).then(serialize(res), onError(res));
  });

  app.post("/keywords", (req, res) => {
    const newWord = (req.body || {}).word;

    I.addKeyword(index, newWord).then(wordAdded(res), onError(res));
  });

  return app.listen(port, (afterStart || (() => {}))());
};

module.exports = createServer;
