import _ from 'lodash';

import diagnoses from './diagnoses';
import similarity from './similarity';

class SearchQuery {
  constructor(query) {
    this.query = query.toLowerCase();
  }

  get queryWords() {
    return this.query.split(' ');
  }

  get results() {
    if (this.query.length === 0) {
      // No query => no matches.
      return [];
    } else if (this.query.length === 1) {
      // Single-letter query => find all words that start with this letter.
      return this.singleLetterMatches;
    } else if (this.exactMatches.length > 0) {
      // First check if there any exact matches. If so, return them.
      return _.sortBy(this.exactMatches, this.matchQuality);
    } else {
      // Otherwise, perform a fuzzy search.
      return _.sortBy(this.fuzzyMatches, this.matchQuality);
    }
  }

  get singleLetterMatches() {
    return diagnoses.filter((dx) =>
      _.some(dx.terms, (term) =>
        _.some(term.split(' '), ((word) => word.startsWith(this.query)))
      )
    );
  }

  get exactMatches() {
    return diagnoses.filter((dx) =>
      _.some(dx.terms, this.termContainsExactMatch)
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
  // e.g. If the query is "brain can", then
  //   termMatchQuality("brain cancer") = (1 + 0.5) / 2 = 0.75
  termMatchQuality = (term) => {
    const words = term.split(' '),
          matchPctPerWord = words.map(this.wordMatchQuality);
    return _.mean(matchPctPerWord)
  }

  // What is the closest that a given word in a diagnosis
  // comes to matching any of the words in the query?
  wordMatchQuality = (dxWord) => (
    _.max(this.queryWords.map((queryWord) =>
      similarity(dxWord, queryWord)
    ))
  )
}

export default function search(query) {
  return new SearchQuery(query).results;
}
