import _ from 'lodash';

import diagnoses from './diagnoses';

class SearchQuery {
  constructor(query) {
    this.query = query.toLowerCase();
  }

  get results() {
    if (this.query === '') {
      // No query => no matches.
      return [];
    } else if (this.exactMatches.length > 0) {
      // First check if there any exact matches. If so, return them.
      return _.sortBy(this.exactMatches, _.negate(this.matchQuality))
    } else {
      // Otherwise, perform a fuzzy search.
      return _.sortBy(this.fuzzyMatches, _.negate(this.matchQuality))
    }
  }

  get queryWords() {
    return this.query.split(' ');
  }

  get exactMatches() {
    return diagnoses.filter((diagnosis) =>
      diagnosis.terms.find(this.termContainsExactMatch)
    );
  }

  get fuzzyMatches() {
    return diagnoses.filter((diagnosis) =>
      this.matchQuality(diagnosis) !== 0
    );
  }

  // The matchQuality of a diagnosis is the max of the termMatchQualities
  // of its constituent terms.
  // (0 = no match, 1 = perfect match.)
  matchQuality = (diagnosis) => (
    _.max(diagnosis.terms.map(this.termMatchQuality))
  )

  // Does the given term either exactly match the whole query
  // or contain a word that matches the whole query?
  termContainsExactMatch = (term) => (
    term === this.query || term.split(' ').includes(this.query)
  )

  // The termMatchQuality of a term is the average wordMatchPercent
  // of each word in it.
  // e.g. If the query is "brain can", then
  //   termMatchQuality("brain cancer") = (1 + 0.5) / 2 = 0.75
  termMatchQuality = (term) => {
    const words = term.split(' '),
          matchPctPerWord = words.map(this.wordMatchPercent);
    return _.mean(matchPctPerWord)
  }

  // What is the closest that a given word in a diagnosis
  // comes to matching any of the words in the query?
  // e.g. If the query is "brain can", then:
  //   wordMatchPercent("brain") = 1
  //   wordMatchPercent("cancer") = 0.5
  //   wordMatchPercent("aids") = 0
  wordMatchPercent = (diagnosisWord) => (
    _.max(this.queryWords.map((queryWord) => {
      if (diagnosisWord.includes(queryWord)) {
        return queryWord.length / diagnosisWord.length;
      } else {
        return 0
      }
    }))
  )
}

export default function search(query) {
  return new SearchQuery(query).results;
}
