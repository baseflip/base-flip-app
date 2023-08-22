import React, { useState, useEffect, useContext, useMemo } from 'react';
import { ethers } from 'ethers';
import { useParams } from 'react-router-dom';
import { Contract } from 'ethers';
import abiData from '../../abi.json';
import EthereumContext from '../../EthereumContext';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";

function AcceptBet() {
  const [gameDetails, setGameDetails] = useState(null);
  const { signer } = useContext(EthereumContext);

  // create contractInstance only when signer changes
  const contractInstance = useMemo(() => {
    return new Contract(CONTRACT_ADDRESS, abiData.abi, signer);
  }, [signer]);

  const { gameId } = useParams();

  useEffect(() => {
    const fetchGameDetails = async () => {
      const game = await contractInstance.games(gameId);
      const betAmountInEther = ethers.formatEther(game.betAmount);
      setGameDetails({
        player1: game.player1,
        betAmount: betAmountInEther
      });
    };

    fetchGameDetails();
  }, [gameId, contractInstance]);

  const handleJoinGame = async () => {
    // Logic to join the game
  };

  return (
    <div>
      {gameDetails ? (
        <>
          <h2>Accept Bet</h2>
          <p>Bet Amount: {gameDetails.betAmount} ETH</p>
          <p>Player 1 Address: {gameDetails.player1}</p>
          <button onClick={handleJoinGame}>Join Game</button>
        </>
      ) : (
        <p>Loading game details...</p>
      )}
    </div>
  );
}

export default AcceptBet;
