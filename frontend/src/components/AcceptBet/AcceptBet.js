import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams } from 'react-router-dom';
import { ethers, JsonRpcProvider, Contract } from 'ethers';
import abiData from '../../abi.json';
import EthereumContext from '../../EthereumContext';
import { useWalletConnection } from '../../hooks/useWalletConnection';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";
const RPC_URL = "https://goerli.base.org";

function AcceptBet() {
  const { account, setAccount, setSigner } = useContext(EthereumContext);
  const { connectWallet } = useWalletConnection(setAccount, setSigner);
  const [gameDetails, setGameDetails] = useState(null);
  const [betExpired, setBetExpired] = useState(false);

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
      const startTime = Number(game.startTime);

      // Check if the current time is more than 15 minutes past the start time
      if (Date.now() / 1000 - startTime > 15 * 60) {
        setBetExpired(true);
        return;
      }

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
      {betExpired ? (
        <p>The bet has expired.</p>
      ) : gameDetails ? (
        <>
          <h2>Accept Bet</h2>
          <p>Bet Amount: {gameDetails.betAmount} ETH</p>
          <p>Player 1 Address: {gameDetails.player1}</p>
          {account ? (
            <button onClick={handleJoinGame}>Accept</button>
          ) : (
            <button className="placeholder-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          )}
        </>
      ) : (
        <p>Loading game details...</p>
      )}
    </div>
  );
}

export default AcceptBet;
