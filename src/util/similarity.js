import _ from 'lodash';
import levenshtein from 'fast-levenshtein';

const editDistance = _.memoize(levenshtein.get, (a, b) => `${a}/${b}`);

// Substring inclusion is used to give a measure of how close two words are:
//   1   => perfect match (strings are equal)
//   0.5 => queryWord is a substring of dxWord and half of its length
//   0   => queryWord is not a substring of dxWord
// e.g. If the query is "brin canc", then:
//   wordMatchQuality("brin") = 0
//   wordMatchQuality("cancer") = 0.67
//   wordMatchQuality("aids") = 0
function substringSimilarity(dxWord, queryWord) {
  if (queryWord.length > 1 && dxWord.includes(queryWord)) {
    return queryWord.length / dxWord.length;
  } else {
    return 0;
  }
}

// Levenshtein distance is used to give a measure of how close two words are:
//   1   => perfect match (Levenshtein distance = 0)
//   0.5 => 3/4 of the word matches (Levenstein distance = length / 4)
//   0   => 1/2 or less of the word matches(Levenstein distance <= length / 2)
// e.g. If the query is "brain canc", then:
//   wordMatchQuality("brain") = 0.6
//   wordMatchQuality("cancer") = 0.33
//   wordMatchQuality("aids") = 0
function levenshteinSimilarity(dxWord, queryWord) {
  return Math.max(0, 1 - (editDistance(dxWord, queryWord) * 2 / dxWord.length));
}

export default function similarity(dxWord, queryWord) {
  return Math.max(
    substringSimilarity(dxWord, queryWord),
    levenshteinSimilarity(dxWord, queryWord)
  );
}