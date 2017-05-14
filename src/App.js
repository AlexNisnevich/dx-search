import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import Results from './components/Results';
import Search from './components/Search';

export default class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      query: ''
    };
  }

  handleChange = (event) => {
    this.setState({ query: event.target.value });
  }

  render() {
    return (
      <MuiThemeProvider>
        <div style={{ textAlign: 'center' }}>
          <Search onChange={this.handleChange} />
          <Results query={this.state.query} />
        </div>
      </MuiThemeProvider>
    );
  }
}
