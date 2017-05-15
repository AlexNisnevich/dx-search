import _ from 'lodash';
import levenshtein from 'fast-levenshtein';

const editDistance = _.memoize(levenshtein.get, (a, b) => `${a}/${b}`);

// Measure how close two words are through substring inclusion:
//   1   => perfect match (strings are identical)
//   0.5 => queryWord is a substring of dxWord and half of its length
//   0   => queryWord is not a substring of dxWord
// e.g. If the query is "brin canc", then:
//   substringSimilarity("brain", "brin") = 0
//   substringSimilarity("cancer", "canc") = 0.67
//   substringSimilarity("aids", "brin" or "canc") = 0
function substringSimilarity(dxWord, queryWord) {
  if (queryWord.length > 1 && dxWord.includes(queryWord)) {
    return queryWord.length / dxWord.length;
  } else {
    return 0;
  }
}

// Measure how close two words are through Levenshtein edit distance:
//   1   => perfect match (Levenshtein distance = 0)
//   0.5 => 3/4 of the word matches (Levenshtein distance = length / 4)
//   0   => 1/2 or less of the word matches(Levenshtein distance <= length / 2)
// e.g. If the query is "brin canc", then:
//   editDistanceSimilarity("brain", "brin") = 0.6
//   editDistanceSimilarity("cancer", "canc") = 0.33
//   editDistanceSimilarity("aids", "brin" or "canc") = 0
function editDistanceSimilarity(dxWord, queryWord) {
  return Math.max(0, 1 - (editDistance(dxWord, queryWord) * 2 / dxWord.length));
}

export default function similarity(dxWord, queryWord) {
  return Math.max(
    substringSimilarity(dxWord, queryWord),
    editDistanceSimilarity(dxWord, queryWord)
  );
}