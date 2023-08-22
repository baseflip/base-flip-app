import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';
import Header from './components/Header/Header';
import Frame from './components/Frame/Frame';
import Bet from './components/Bet/Bet';
import AcceptBet from './components/AcceptBet/AcceptBet';
import GameResult from './components/GameResult/GameResult';
import EthereumContext from './EthereumContext'; // Adjust the path to where you've placed EthereumContext.js
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);

  return (
    <Router>
      <div className="App">
        <EthereumContext.Provider value={{ account, setAccount, signer, setSigner }}>
          <Header />
          <Frame>
            <Routes>
              <Route path="/" element={<Bet />} />
              <Route path="/room/:id" element={<AcceptBet />} />
              <Route path="/game-result/:id" element={<GameResult />} />
            </Routes>
          </Frame>
        </EthereumContext.Provider>
      </div>
    </Router>
  );
}

export default App;
