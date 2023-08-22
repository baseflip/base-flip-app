import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { ethers, JsonRpcProvider, Contract } from 'ethers';
import abiData from '../../abi.json';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";
const RPC_URL = "https://goerli.base.org";

function AcceptBet() {
  const [gameDetails, setGameDetails] = useState(null);

  // Create a provider instance to connect to a custom Ethereum node
  const provider = useMemo(() => {
    return new JsonRpcProvider(RPC_URL);
  }, []);

  // Create a contract instance using the public provider
  const contractInstance = useMemo(() => {
    return new Contract(CONTRACT_ADDRESS, abiData.abi, provider);
  }, [provider]);

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
