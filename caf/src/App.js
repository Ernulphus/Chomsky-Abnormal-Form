import './App.css';
import React, {Component} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

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
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={HomeComponent()}/>
          <Route exact path="/nfadiagram" element={nfadiagramComponent()}/>
          <Route exact path="/regex" render={RegexComponent()}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
