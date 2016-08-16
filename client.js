const R = require("ramda");
const fs = require("fs");
const path = require("path");
const request = require("superagent");
const process = require("process");
const { TaskQueue } = require("cwait");

const createServer = require("./src/gelijk/app");
const tempfile = require("tempfile");

const WORDS_PATH = path.join(__dirname, "data", "words");
const PORT = 31234;

const queue = new TaskQueue(Promise, 50);

const requestHandler = (reject, resolve) => (err, res) => {
  if (err || !res.ok) {
    reject(err);
  } else {
    resolve(JSON.parse(res.text));
  }
};

const buildRequest = (withMethod, { path, payload } = {}) => new Promise((res, rej) => {
  setTimeout(() => {
    const uri = `http://localhost:${PORT}/keywords${ path ? path : ""}`;
    const req = withMethod(uri).set("Content-Type", "application/json");

    if (payload) {
      req.send(JSON.stringify(payload));
    }

    req.end(requestHandler(rej, res));
  }, Math.floor(Math.random() * 5));
});

const addWord = queue.wrap((word) => buildRequest(request.post, { payload: { word } }));
const listWords = queue.wrap(() => buildRequest(request.get));
const clearWords = queue.wrap(() => buildRequest(request.delete));
const searchWord = queue.wrap((word, threshold) => (
  buildRequest(request.get, { path: "/search", payload: { word, threshold }})
));

const selectSubset = (count, set) => {
  let selected = new Set();

  if (count > set.length) {
    count = set.length;
  }

  while (selected.size !== count) {
    const newWord = set[Math.floor(Math.random() * set.length)];
    selected.add(newWord.toLowerCase());
  }

  return Array.from(selected);
};

/**
 * It is expected that a more lenient threshold results in a larger
 * result set than a less lenient one. This calls the service with an
 * increasing threshold value and returns a `Promise (string,
 * boolean)`, a mapping of a word and the confirmation that this
 * expectation is valid.
 */
const searchAllWithIncreasingThresholdsYieldsLargerAndLargerValues = (words) => (
  Promise.all(R.map((w) => (
    Promise.all([searchWord(w, 0), searchWord(w, 1), searchWord(w, 2), searchWord(w, 3)])
      .then((rs) => [w, rs[0].length <= rs[1].length <= rs[2].length <= rs[3].length])
  ), words))
);

const checkThatEverythingThatWentInCameOut = (selectedSet) => (fetchedWords) => {
  if (fetchedWords.length === selectedSet.length) {
    console.log("Every word that's gone in has come out!");
  } else {
    console.log(`Words are missing (${fetchedWords.length}/${selectedSet.length}):`);
    console.log(R.difference(selectedSet, fetchedWords));
  }

  return fetchedWords;
};

const checkThatIncreasingThresholdWidensResults = (wrs) => {
  const alwaysWidens = R.all(([w_, allIncreasing]) => allIncreasing, wrs);
  if (!alwaysWidens) {
    console.log("Look, we expected broader results in broader searches, but nothing of the sort happened!");
  } else {
    console.log("Yay! We can perform cool searches!");
  }
};

/**
 * This will select a subset of a standard Unix `words` file, with
 * about 235k English words, and hit the API to perform the following checks:
 *
 *   - Every word that was sent to the service was added
 *   - Widening the search space widens the result set
 */
const main = () => {
  const server = createServer({
    port: PORT,
    indexStoragePath: tempfile(".db")
  });

  const words = R.filter(R.compose(R.not, R.isEmpty),
                         fs.readFileSync(WORDS_PATH).toString().split("\n"));

  const selectedSet = selectSubset(10000, words);
  const addSelected = R.map(addWord, selectedSet);

  console.log("Here's what I'm gonna do: I will select a subset of a standard Unix `words` file, with about 235k English words, hit the API, and then check the following:");
  console.log("\n\t- Every word that was sent to the service was added");
  console.log("\t- Widening the search space widens the result set");
  console.log("\nFingers crossed!");
  console.log("-------------------------------------------------------\n");

  Promise
    .all(addSelected)
    .then(listWords)
    .then(checkThatEverythingThatWentInCameOut(selectedSet))
    .then(searchAllWithIncreasingThresholdsYieldsLargerAndLargerValues)
    .then(checkThatIncreasingThresholdWidensResults)
    .then(() => {
      console.log("We're done.");
      process.exit();
    })
    .catch((err) => {
      console.log("Something went wrong:", err);
      clearWords();
      process.exit(1);
    });
};

main();
