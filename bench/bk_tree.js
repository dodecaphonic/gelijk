const Benchmark = require("benchmark");
const fs = require("fs");
const path = require("path");
const R = require("ramda");

const T = require("../src/gelijk/bk_tree");
const areSimilar = require("../src/gelijk/similar");


const WORDS_PATH = path.join(__dirname, "..", "data", "words");

console.log("Reading words...");
const words = R.take(1000, fs.readFileSync(WORDS_PATH).toString().split("\n"));

console.log(`Building tree (${words.length} words)...`);
const tree = R.reduce(T.addWord, T.createTree(words[Math.floor(words.length / 2)]), words);

const bfSearch = (refWord, threshold) => (
  R.filter((w) => areSimilar(refWord, w, threshold), words)
);

const suite = new Benchmark.Suite;

console.log("Benchmarking...");
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
