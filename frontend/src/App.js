import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import React from 'react';
import Header from './components/Header/Header';
import Frame from './components/Frame/Frame';
import Bet from './components/Bet/Bet';
import AcceptBet from './components/AcceptBet/AcceptBet';
import GameResult from './components/GameResult/GameResult';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Header />
        <Frame>
          <Routes>
            <Route path="/" element={<Bet />} />
            <Route path="/room/:id" element={<AcceptBet />} />
            <Route path="/game-result/:id" element={<GameResult />} />
          </Routes>
        </Frame>
      </div>
    </Router>
  );
}

export default App;