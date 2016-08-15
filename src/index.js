const bodyParser = require("body-parser");
const Either = require("data.either");

const T = require("./gelijk/bk_tree");
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
    return [];
  } else if (word == null || word === "") {
    return Either.Left("You must specify a word to search the keywords");
  } else {
    const t = threshold != null ? parseInt(threshold) : 3;

    return Either.of(T.searchWords(keywords, t, word));
  }
};

const identity = (res) => (v) => res.send(JSON.stringify(v));
const wordAdded = (res) => (word) => res.send(`Added "${word}"`);
const onError = (res) => (err) => res.status(400).send(err);

app.use(bodyParser.json());

app.get("/keywords", (req, res) => {
  res.send(JSON.stringify(T.allWords(keywords)));
});

app.get("/keywords/search", (req, res) => {
  searchWords(req.body).fold(onError(res), identity(res));
});

app.post("/keywords", (req, res) => (
  addNewWord(req.body).fold(onError(res), wordAdded(res))
));

app.listen(8128, () => {
  console.log("Gelijk running on port 8128");
});
