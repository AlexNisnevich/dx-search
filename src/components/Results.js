import React, { Component } from 'react';
import { string } from 'prop-types';
import _ from 'lodash';

import diagnoses from '../data/diagnoses';

// e.g. "HPV (human papilloma virus)" => ["HPV", "human papilloma virus"]
function getSynonyms(diagnosis) {
  if (diagnosis.includes(' (')) {
    const [beforeParen, afterOpenParen] = diagnosis.split(' ('),
          [betweenParens] = afterOpenParen.split(')');
    return [beforeParen, betweenParens];
  } else {
    return [diagnosis];
  }
}

export default class Results extends Component {
  static propTypes = {
    query: string
  }

  get queryWords() {
    return this.props.query.toLowerCase().split(' ');
  }

  get matches() {
    if (this.props.query === '') {
      return diagnoses;
    } else {
      return _(diagnoses).filter((d) => this.diagnosisMatchQuality(d) > 0)
                         .sortBy((d) => -this.diagnosisMatchQuality(d))
                         .value();
    }
  }

  termMatchPercent = (diagnosisTerm) => {
    const matchPctPerWord = this.queryWords.map((word) => {
      if (diagnosisTerm.toLowerCase().includes(word)) {
        return word.length / diagnosisTerm.length;
      } else {
        return 0
      }
    })
    return _.max(matchPctPerWord);
  }

  synonymMatchQuality = (synonym) => {
    const terms = synonym.split(' '),
          matchPctPerTerm = terms.map(this.termMatchPercent);
    return _.mean(matchPctPerTerm)
  }

  diagnosisMatchQuality = (diagnosis) => {
    const synonyms = getSynonyms(diagnosis);
    return _.max(synonyms.map(this.synonymMatchQuality));
  }

  render() {
    return (
      <div style={{ fontSize: 'white' }}>
        {
          this.matches.map((diagnosis) =>
            <p key={diagnosis}>
              {diagnosis}
            </p>
          )
        }
      </div>
    )
  }
}
