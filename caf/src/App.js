import './App.css';
import React, {Component} from 'react';
import {BrowserRouter, Route, Routes} from 'react-router-dom';

import Home from './components/Home.js';
import Nfadiagram from './components/nfadiagram.js';

function App() {

  const HomeComponent = () => (
    <Home />
  )

  const nfadiagramComponent = () => (
    <Nfadiagram />
  )

  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={HomeComponent()}/>
          <Route exact path="/nfadiagram" element={nfadiagramComponent()}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
