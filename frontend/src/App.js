import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useState } from 'react';
import Header from './components/Header/Header';
import Frame from './components/Frame/Frame';
import Bet from './components/Bet/Bet';
import AcceptBet from './components/AcceptBet/AcceptBet';
import GameResult from './components/GameResult/GameResult';
import EthereumContext from './EthereumContext';
import './App.css';

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const [contractAddress] = useState("0xf2574b2fBa0eBf42472eD32cC1DbC4e88b2B6061");

  return (
    <Router>
      <div className="App">
        <EthereumContext.Provider value={{ account, setAccount, signer, setSigner, error, setError, contractAddress }}>
          <Header />
          <Frame>
            <Routes>
              <Route path="/" element={<Bet />} />
              <Route path="/room/:gameId" element={<AcceptBet />} />
              <Route path="/game-result/:gameId" element={<GameResult />} />
            </Routes>
          </Frame>
        </EthereumContext.Provider>
      </div>
    </Router>
  );
}

export default App;
