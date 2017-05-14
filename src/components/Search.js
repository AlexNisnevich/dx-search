import React, { Component } from 'react';
import { func } from 'prop-types';
import TextField from 'material-ui/TextField';

export default class TextFieldExampleControlled extends Component {
  static propTypes = {
    onChange: func
  }

  render() {
    return (
      <div style={{
        backgroundColor: '#222',
        padding: 20
      }}>
        <TextField
          name="Search"
          hintText="Enter your query ..."
          onChange={this.props.onChange}
          inputStyle={{ color: '#ddd' }}
          hintStyle={{ color: '#bbb' }}
        />
      </div>
    );
  }
}