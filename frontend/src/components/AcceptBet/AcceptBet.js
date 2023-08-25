import React, { useState, useEffect, useMemo, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers, WebSocketProvider, Contract } from 'ethers';
import abiData from '../../abi.json';
import EthereumContext from '../../EthereumContext';
import { useWalletConnection } from '../../hooks/useWalletConnection';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";

function AcceptBet() {
  const { account, signer, setAccount, setSigner } = useContext(EthereumContext);
  const { connectWallet } = useWalletConnection(setAccount, setSigner);
  const [gameDetails, setGameDetails] = useState(null);
  const [betExpired, setBetExpired] = useState(false);
  const { gameId } = useParams();
  const navigate = useNavigate();

  // Create a provider instance to connect to a custom Ethereum node
  const provider = useMemo(() => {
    return new WebSocketProvider(
    `wss://delicate-crimson-dew.base-goerli.discover.quiknode.pro/3e739828ff34548682516310c83e2dbbb604b2b8/`
  );
  }, []);
  
  // Create a contract instance using the public provider
  const contractInstance = useMemo(() => {
    return new Contract(CONTRACT_ADDRESS, abiData.abi, provider);
  }, [provider]);

  // Create a contract instance using the signer
  const contractInstanceSigner = useMemo(() => {
    return new Contract(CONTRACT_ADDRESS, abiData.abi, signer);
  }, [signer]);

  useEffect(() => {
    // Listen to the "CoinFlipped" event
    const onCoinFlipped = (gameIdEvent, winner) => {
      console.log("hi from AcceptBet.js");
      // Redirect to the "gameResult" component with the winner information
      if(Number(gameIdEvent) === Number(gameId)) {
        navigate('/game-result/' + gameId, { state: { winner, gameId } });
      }
    };
  
    contractInstance.on("CoinFlipped", onCoinFlipped);
    // return () => {
    //   contractInstanceProvider.off("CoinFlipped", onCoinFlipped);
    // };
  }, [contractInstance, navigate, gameId]);


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
        betAmount: betAmountInEther,
        betAmountRaw: game.betAmount
      });
    };

    fetchGameDetails();
  }, [gameId, contractInstance]);

  const handleJoinGame = async () => {
    try {
      // Logic to join the game
      console.log(gameId, gameDetails.betAmountRaw);
      const gasLimit = 120000;
      const tx = await contractInstanceSigner.joinGame(gameId, { value: gameDetails.betAmountRaw, gasLimit: gasLimit });
      await tx.wait();
    } catch (error) {
      console.error("An error occurred while joining the game:", error);
    }
  };

  return (
    <div>
      {betExpired ? (
        <p>The bet has expired.</p>
      ) : gameDetails && gameId ? (
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
