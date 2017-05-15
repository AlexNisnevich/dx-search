# Diagnosis search work sample

## Organization

**DxSearch** is a React JS app created with [`create-react-app`](https://github.com/facebookincubator/create-react-app) boilerplate. The code is organized as follows:

- [`src/App.js`](https://github.com/AlexNisnevich/dx-search/blob/master/src/App.js) – main entry point for the application
- [`src/components/DiagnosisSearch.js`](https://github.com/AlexNisnevich/dx-search/blob/master/src/components/DiagnosisSearch.js) – Search component, which handles user input and calls the `search()` method exported from `util/search.js` to get the list of terms to display
- [`src/data/diagnoses.js`](https://github.com/AlexNisnevich/dx-search/blob/master/data/diagnoses.js) - Raw diagnosis strings provided in the email
- [`src/util/diagnoses.js`](https://github.com/AlexNisnevich/dx-search/blob/master/util/diagnoses.js) – Diagnoses pre-processing logic
- [`src/util/search.js`](https://github.com/AlexNisnevich/dx-search/blob/master/util/search.js) - Search logic, wrapped in a `SearchQuery` class
- [`src/util/similarity.js`](https://github.com/AlexNisnevich/dx-search/blob/master/util/similarity.js) – String similarity logic

## Evaluation criteria

To determine the best results for a given query, I work from the bottom up:

### Scoring word<->word similarity

To score the similarity between two words (a word in the query and a word in a diagnosis), I use two different similarity criteria and take the max of the them.

The `substringSimilarity` metric simply checks to see if the `queryWord` is a substring of the `dxWord`. If it is, the score is the ratio of their lengths. For example, `substringSimilarity("cancer", "canc") = 4/6`. This is a particularly useful metric when a user has partially typed in a word.

The `editDistanceSimilarity` metric computes the Levenshtein edit distance between the words (using the [`fast-levenshtein`](https://github.com/hiddentao/fast-levenshtein) library). The score given is _(1 – 2*(edit distance)/(length of `dxWord`) )_ or 0, whichever is greater. For example, `substringSimilarity("cancer", "canc") = 2/6`. This is a particularly useful metric when a user has slightly misspelled a word.

### Scoring terms

Each term within a diagnosis (for example, the diagnosis _"chronic fatigue syndrome (CFS)"_ has two constituent terms: _"chronic fatigue syndrome"_ and _"CFS"_) is scored as follows:

First, the term is broken up into words. Each word within the term has its similarity evaluated against each word in the query, and the max of these is taken to be the score of the word. Then the score of the term is simply the average (arithmetic mean) of the scores of its terms.

Comparing each word in each diagnosis against each word in the query is not the most efficient approach, but it's the best way I could think of to gracefully handle multi-word queries where some words may or may not be relevant, without making the code too complex.

### Scoring diagnoses

In general, the score given to a diagnosis is the max of the score of its constituent terms. All diagnoses with a score > 0 are returned, in order of decreasing score.

However, there are two special cases:
- If the query consists of a single letter, then rather than computing scores for diagnoses, I simply return all diagnoses that contain a word that starts with that letter (in alphabetical order).
- If there are any "exact matches" for the query – that is, diagnoses that either are identical to the query or contain a word that is identical to the query – then only exact matches are returned.

My reasoning for the single-letter case is that it would be hepful for the user to see possible hints when they just start typing in a word, even if neither word similarity metric can produce any reasonable results with this little input. My reasoning for the exact-matches case is that, for example, if a user types in "cancer", it would not be particularly helpful to see fuzzy matches of the word "cancer", since it's clear that this is the word the user meant to type.

## Design decisions

###

## Further work
