import logo from './logo.svg';
import './App.css';
import React, {Component} from 'react';
import {BrowserRouter as Router, Route} from 'react-router-dom';

import Home from './components/Home.js';
import Nfadiagram from './components/nfadiagram.js';
import Regex from './components/Regex.js';

function App() {

  const HomeComponent = () => (
    <Home />
  )

  const nfadiagramComponent = () => (
    <Nfadiagram />
  )

  const RegexComponent = () => (
    <Regex />
  )

  return (
    <div className="App">
      <Router>
        <Route exact path="/" render={HomeComponent}/>
        <Route exact path="/nfadiagram" render={nfadiagramComponent}/>
        <Route exact path="/regex" render={RegexComponent}/>
      </Router>
    </div>
  );
}

export default App;
