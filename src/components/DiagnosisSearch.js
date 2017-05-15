import React, { Component } from 'react';
import AutoComplete from 'material-ui/AutoComplete';
import MenuItem from 'material-ui/MenuItem';
import _ from 'lodash';

import search from '../util/search';

export default class DiagnosisSearch extends Component {
  constructor(props) {
    super(props);

    this.state = {
      results: []
    };
  }

  handleUpdateInput = (query) => {
    const results = search(query).map(this.renderDiagnosis);
    this.setState({ results });
  }

  renderDiagnosis = (diagnosis) => ({
    text: diagnosis.text,
    value: <MenuItem primaryText={diagnosis.text} style={this.styles.result} />
  })

  get styles() {
    const width = 400,
          fontSize = 20;

    return {
      container: { padding: 50, textAlign: 'center' },

      textField: { fontSize, width },
      input: { color: '#ddd' },
      hint: { color: '#bbb' },

      list: { maxHeight: 500, overflow: 'auto', width },
      result: { fontSize, width }
    }
  }

  render() {
    return (
      <div style={this.styles.container}>
        <AutoComplete
          dataSource={this.state.results}
          onUpdateInput={this.handleUpdateInput}
          filter={_.constant(true)}
          hintText="Search for a diagnosis ..."
          style={this.styles.textField}
          textFieldStyle={this.styles.textField}
          inputStyle={this.styles.input}
          hintStyle={this.styles.hint}
          listStyle={this.styles.list}
        />
      </div>
    );
  }
}