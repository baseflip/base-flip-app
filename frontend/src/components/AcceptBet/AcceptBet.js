import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import './AcceptBet.css';

function AcceptBet() {
  const { id: gameId } = useParams();
  const betAmount = "0.1";
  const offererAddress = "0x1234...abcd";
  const navigate = useNavigate();

  const handleAccept = () => {
      // logic for accepting the bet

      // Once the bet is accepted, navigate to the GameResult route
      navigate(`/game-result/${gameId}`);
  };

  return (
    <div className="acceptbet-container">
      <div className="acceptbet-heading">Accept Bet</div>
      <p className="acceptbet-info">You've been offered a bet by address: {offererAddress}</p>
      <p className="acceptbet-amount">Bet Amount: {betAmount} ETH</p>
      <button className="acceptbet-button" onClick={handleAccept}>Accept</button>
    </div>
  );
}

export default AcceptBet;
