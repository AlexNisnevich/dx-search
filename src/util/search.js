import _ from 'lodash';
import levenshtein from 'fast-levenshtein';

import diagnoses from './diagnoses';

const levenshteinDistance = _.memoize(levenshtein.get, (a, b) => `${a}/${b}`);

class SearchQuery {
  constructor(query) {
    this.query = query.toLowerCase();
  }

  get queryWords() {
    return this.query.split(' ');
  }

  get results() {
    if (this.query === '') {
      // No query => no matches.
      return [];
    } else if (this.exactMatches.length > 0) {
      // First check if there any exact matches. If so, return them.
      return _.sortBy(this.exactMatches, this.matchQuality);
    } else {
      // Otherwise, perform a fuzzy search.
      return _.sortBy(this.fuzzyMatches, this.matchQuality);
    }
  }

  get exactMatches() {
    return diagnoses.filter((dx) =>
      dx.terms.find(this.termContainsExactMatch)
    );
  }

  get fuzzyMatches() {
    return diagnoses.filter((dx) =>
      this.matchQuality(dx) < 0
    );
  }

  // The matchQuality of a diagnosis is -1 * (the max of the termMatchQualities
  // of its constituent terms).
  // Note: Since _.sortBy sorts ascending, matchQuality is always negative.
  // (0 = no match, -1 = perfect match.)
  matchQuality = (dx) => (
    -_.max(dx.terms.map(this.termMatchQuality))
  )

  // Does the given term either exactly match the whole query
  // or contain a word that matches the whole query?
  termContainsExactMatch = (term) => (
    term === this.query || term.split(' ').includes(this.query)
  )

  // The termMatchQuality of a term is the average wordMatchQuality
  // of each word in it.
  // e.g. If the query is "brain canc", then
  //   termMatchQuality("brain cancer") = (1 + 0.33) / 2 = 0.66
  termMatchQuality = (term) => {
    const words = term.split(' '),
          matchPctPerWord = words.map(this.wordMatchQuality);
    return _.mean(matchPctPerWord)
  }

  // What is the closest that a given word in a diagnosis
  // comes to matching any of the words in the query?
  // Levenshtein distance is used to give a measure of how close two words are:
  //   1   => perfect match (Levenshtein distance = 0)
  //   0.5 => 3/4 of the word matches (Levenstein distance = length / 4)
  //   0   => 1/2 or less of the word matches(Levenstein distance <= length / 2)
  // e.g. If the query is "brain canc", then:
  //   wordMatchQuality("brain") = 1
  //   wordMatchQuality("cancer") = 0.33
  //   wordMatchQuality("aids") = 0
  wordMatchQuality = (dxWord) => (
    Math.max(0, _.max(this.queryWords.map((queryWord) =>
      1 - (levenshteinDistance(queryWord, dxWord) * 2 / dxWord.length)
    )))
  )
}

export default function search(query) {
  return new SearchQuery(query).results;
}
