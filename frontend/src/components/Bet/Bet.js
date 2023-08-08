import React, { useState } from 'react';
import './Bet.css';

function Bet() {
  const [betAmount, setBetAmount] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [canWithdraw, setCanWithdraw] = useState(false); // New state

  const handleDeposit = () => {
    // Logic to initiate web3 transaction goes here

    // For now, we'll generate a placeholder link
    const link = "http://yourapp.com/room/" + Date.now();
    setGeneratedLink(link);
  };

  return (
    <div className="bet-container">
      <div className="heading-section">
        <h2>Create a new bet and share it</h2>
        <div className="info-icon">
          ⓘ
          <div className="tooltip">Enter the desired bet size in the field below and click on deposit. After you've deposited your ETH, a link will be generated which you can share with your counterparty.</div>
        </div>
      </div>
      <div className="bet-input-section">
        <input 
          type="number" 
          value={betAmount} 
          onChange={(e) => setBetAmount(e.target.value)} 
          placeholder="Bet amount" 
        />
        <button onClick={handleDeposit}>Deposit</button>
        <div className="withdraw-section">
          <button 
            onClick={() => {/* Withdraw logic here */}} 
            disabled={!canWithdraw}
            style={{ backgroundColor: canWithdraw ? '#4CAF50' : 'gray' }}
          >
            Withdraw
          </button>
          {!canWithdraw && (
            <div className="tooltip-withdraw">
              You can withdraw only once the bet has expired without the other user accepting, which takes 15 minutes.
            </div>
          )}
        </div>
      </div>
      {generatedLink && <input type="text" readOnly value={generatedLink} />}
    </div>
  );
}

export default Bet;
