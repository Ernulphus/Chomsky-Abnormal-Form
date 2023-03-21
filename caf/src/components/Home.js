import React, { Component } from 'react';
import {Link} from 'react-router-dom';

class Home extends Component {
  render(){
    return (
      <div class="Home">
        <h1>Regular Languages</h1>

        <h2 class="Home-links">
        <div>
        <Link to="/nfadiagram">NFA Diagram Maker</Link><br/>
        <Link to="/regex">Regex Evaluator</Link>
        </div>
        </h2>

      </div>
    );
  }
}

export default Home;
