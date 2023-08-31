import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from './components/Header/Header';
import Frame from './components/Frame/Frame';
import Bet from './components/Bet/Bet';
import AcceptBet from './components/AcceptBet/AcceptBet';
import GameResult from './components/GameResult/GameResult';
import EthereumContext from './EthereumContext';
import './App.css';

const RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const queryString = new URLSearchParams(window.location.search);
    const path = queryString.get('p');
    if (path) {
      navigate(path);
    }
  }, [navigate]);

  return null;
};

function App() {
  const [account, setAccount] = useState(null);
  const [signer, setSigner] = useState(null);
  const [error, setError] = useState(null);
  const [contractAddress] = useState("0xD7d626aA0A0960Ae7205810fE15bff260af8eaFc");

  return (
    <Router>
      <RedirectHandler />
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
