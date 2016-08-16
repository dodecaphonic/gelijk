# gelijk

[![CircleCI](https://circleci.com/bb/dodecaphonic/gelijk.svg?style=svg)](https://circleci.com/bb/dodecaphonic/gelijk)

Gelijk (Dutch for 'equal' or 'equivalent') is an award-winning, world-class keyword search engine that allows you to spell like a mumbling drunkard and still get everything you want.

## Running

Gelijk is written in node.js, and requires version >= 6.2.1. If you don't have node, please [get it][nodejs] for your platform and make sure `node` and `npm` are in your `PATH`.

To run gelijk, run the following:

     $ cd gelijk
     $ npm install
     $ npm start

This will start the server on port 8128 by default. If you wish to change it, use the `PORT` environment variable, like below:

     $ PORT=7331 npm start
     
By default, keywords added via the API are stored in `<project root>/db/index.db`.

## API

The API offers two endpoints, which in turn describe four different operations. They are as follows:

- `/keywords`:
    - `GET`: returns a list of keywords as a JSON array
    - `POST`: adds a new keyword to the set
    - `DELETE`: clears the set of stored keywords
- `/keywords/search`:
    - `GET`: returns a list of keywords matching a reference word. If a threshold number for the maximum edit distance is passed, it uses that; otherwise, it defaults to `3`.
  
### Usage

The API both receives and returns JSON payloads. You should set the `Content-Type` header to `application/json` when performing your calls.

#### Adding a keyword

A User should pass in a payload **as the request body** in the following format:

    { word: <string> }
     
An example `curl` call looks like this:

    $ curl -XPOST -H "Content-Type: application/json" -d '{ "word": "wordelicious" }' http://localhost:8128/keywords
    {"word":"wordelicious","added":true}
    
#### Listing all keywords

    $ curl http://localhost:8128/keywords
    ["wordelicious"]
    
#### Searching keywords

A User should pass in a payload **as the request body** in the following format:

    { word: <string>, threshold: <optional: number> }

    $ curl -XGET -H "Content-Type: application/json" -d '{ "word": "word", "threshold": 10 }' http://localhost:8128/keywords/search
    ["wordelicious"]
    $ curl -XGET -H "Content-Type: application/json" -d '{ "word": "delicious" }' http://localhost:8128/keywords/search # defaults to threshold 3
    ["wordelicious"]
    $ curl -XGET -H "Content-Type: application/json" -d '{ "word": "delicious", "threshold": 2 }' http://localhost:8128/keywords/search
    []

#### Clearing stored keywords

    $ curl -XDELETE http://localhost:8128/keywords
    {"cleared":true}
    
## Design

Gelijk follows the guidelines established by OLX's challenge proposition, namely:

- Implements its own Levenshtein distance algorithm;
- Implements a web API that allows a User to:
    - Store a keyword;
    - Retrieve/show stored keywords;
    - Retrieve a list of stored keywords matching a reference word, within an edit distance of said reference word.
- Includes thorough tests;
- Follows production-grade quality practices.

As a design goal, it is written with techniques of functional programming in mind. That means, in summary, that its functions are referentially-transparent (unless they perform IO), composable and repurposable. That also means you won't see `class` or `new` in its code: everything is explicit, and state must be woven in an out.

## Developing

Gelijk is written in node.js, and requires version >= 6.2.1. If you don't have node, please [get it][nodejs].

To work on gelijk, run the following:

     $ cd gelijk
     $ npm install
     $ npm test

If tests run correctly, you're pretty much set up, as no other dependencies are required.

There's a couple of benchmarks that have been for optimizing the tree and the final levenshtein implementation. They can be run with `npm run bench`. Be mindful of them as you make changes with the goal of improving performance.

## Testing

There's two ways to run tests:

     $ npm test
     $ npm run watch-test
     
The first one performs a single run. The second runs all tests as changes are made to files in the project.

A goal of the project is to have as many [property-based tests][proptests] (shameless plug of author's own blog) as possible, written with [jsverify][jsv]. That requires you to think much harder when adding functionality, as you must think of quasi-proofs of the code being written in the form of boolean properties. The test infrastructure will then generate inputs for you to check if they hold.

If you're not familiar with the technique, check out the tests for the BK Tree and the Levenshtein distance implementation.

[nodejs]: https://nodejs.org
[proptests]: http://www.troikatech.com/blog/2014/04/02/property-based-testing-in-ruby/
[jsverify]: https://github.com/jsverify/jsverify
