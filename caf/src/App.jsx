import './App.css';
import React from 'react';
import {
  BrowserRouter,
  Route,
  Routes,
  Navigate,
} from 'react-router-dom';

import Home from './components/Home';
import NFADiagram from './components/NFADiagram';
import RegexConverter from './components/RegexConverter';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/nfadiagram" element={<NFADiagram />} />
          <Route exact path="/regex" element={<RegexConverter />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
