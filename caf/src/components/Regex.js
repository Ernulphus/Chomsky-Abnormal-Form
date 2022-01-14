import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class Regex extends Component {

  constructor(props) {
    super(props);
    this.state = {
      regex: 'ab*c',
      lastword: "",
      response: true
    }

    this.setRegex = this.setRegex.bind(this);
  }

  setRegex = (event) => {
    event.preventDefault();
    this.setState({regex: event.target[0].value, lastword: ""});
  }

  testWord = (event) => {
    event.preventDefault();
    let word = event.target[0].value;
    let re = new RegExp(this.state.regex);
    let found = word.match(re);
    if (found == null) {
      console.log("word not accepted");
      this.setState({lastword: word, response: false})
    }
    else {
      if (found.some(e => e == word)) {
        console.log("word accepted");
        this.setState({lastword: word, response: true})
      }
      else {
        console.log("word not accepted");
        this.setState({lastword: word, response: false})
      }
    }
  }

  render(){
    let regexResponse = <div></div>;
    const negativeResponseStyle = {
      backgroundColor: "pink",
      padding: "10px",
      width: "300px",
      margin: "auto",
      width: "50%",
      borderRadius: "25px"
    };
    const positiveResponseStyle = {
      backgroundColor: "lightblue",
      padding: "10px",
      width: "300px",
      margin: "auto",
      width: "50%",
      borderRadius: "25px"
    };
    if (this.state.lastword != "") {
      if (this.state.response) {
        regexResponse = <div style={positiveResponseStyle} ><p>This word is accepted.</p></div>
      }
      else {
        regexResponse = <div style={negativeResponseStyle} ><p>This word is NOT accepted.</p></div>
      }
    }
    return (
      <div className="Regex">
        <div className="RegexExpression">
          <h1>{this.state.regex}</h1>
        </div>
        <div className="RegexInput">
          <form onSubmit={this.setRegex}>
            <label>
              Regular Expression:
              <input type="text" name="regex" />
            </label>
            <input type="submit" value="Submit" />
          </form>
          <a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#using_special_characters">Formatting Reference</a>
          <form onSubmit={this.testWord}>
            <label>
              Word:
              <input type="text" name="word" />
            </label>
            <input type="submit" value="Submit" />
          </form>
        </div>
        <div className="RegexResponse">
          <h2>{regexResponse}</h2>
        </div>
      </div>
    );
  }
}

export default Regex;
