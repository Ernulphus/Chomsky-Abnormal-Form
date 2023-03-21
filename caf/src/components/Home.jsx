import React from 'react';
import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="Home">
      <h1>Regular Languages</h1>
      <h2 className="Home-links">
        <div>
          <Link to="/nfadiagram">NFA Diagram Maker</Link>
          <br />
          <Link to="/regex">Regex Evaluator</Link>
        </div>
      </h2>
    </div>
  );
}

export default Home;
