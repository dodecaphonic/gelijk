const Benchmark = require("benchmark");
const fs = require("fs");
const path = require("path");
const R = require("ramda");

const T = require("../src/gelijk/bk_tree");
const levenshtein = require("../src/gelijk/levenshtein");
const areSimilar = require("../test/helpers/similar");
const naiveLevenshtein = require("../test/helpers/levenshtein");

const WORDS_PATH = path.join(__dirname, "..", "data", "words");

const benchLevenshtein = () => {
  const suite = new Benchmark.Suite;

  console.log("Benchmarking Levenshtein...");
  suite
    .add("recursive", () => {
      naiveLevenshtein("angular", "regular");
    })
    .add("dynamic programming", () => {
      levenshtein("angular", "regular");
    })
    .on("complete", function() {
      console.log("Fastest is " + this.filter("fastest").map("name"), "\n");

      console.log(this[0].toString());
      console.log(this[1].toString());
    })
    .run();
};

const benchTree = () => {
  console.log("Reading words...");
  const words = R.take(10000, fs.readFileSync(WORDS_PATH).toString().split("\n"));

  console.log(`Building tree (${words.length} words)...`);
  const tree = R.reduce(T.addWord, T.createTree(words[Math.floor(words.length / 2)]), words);

  const bfSearch = (refWord, threshold) => (
    R.filter((w) => areSimilar(refWord, w, threshold), words)
  );

  const suite = new Benchmark.Suite;

  console.log("Benchmarking set filtering...");
  suite
    .add("linear search (t: 3)", () => {
      bfSearch("angular", 3);
    })
    .add("tree search (t: 3)", () => {
      T.searchWords(tree, 3, "angular");
    })
    .on("complete", function() {
      console.log("Fastest is " + this.filter("fastest").map("name"), "\n");

      console.log(this[0].toString());
      console.log(this[1].toString());
    })
    .run();
};

benchLevenshtein();
console.log("\n------------------------------------------------------\n");
benchTree();
