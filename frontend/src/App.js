import React from 'react';
import Header from './components/Header/Header';
import Frame from './components/Frame/Frame';
import Bet from './components/Bet/Bet';
import './App.css';

function App() {
  return (
    <div className="App">
      <Header />
      <Frame>
        <Bet />
      </Frame>
    </div>
  );
}

export default App;
