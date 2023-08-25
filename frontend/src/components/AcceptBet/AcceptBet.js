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
  const [withdrawn, setWithdrawn] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const navigate = useNavigate();

  // Create a provider instance to connect to a custom Ethereum node
  const provider = useMemo(() => {
    return new WebSocketProvider(
    `wss://delicate-crimson-dew.base-goerli.discover.quiknode.pro/3e739828ff34548682516310c83e2dbbb604b2b8/`
  );
  }, []);
  
  // Create a contract instance using the public provider
  const contractInstanceProvider = useMemo(() => {
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
  
    contractInstanceProvider.on("CoinFlipped", onCoinFlipped);
    // return () => {
    //   contractInstanceProvider.off("CoinFlipped", onCoinFlipped);
    // };
  }, [contractInstanceProvider, navigate, gameId]);


  useEffect(() => {
    const fetchGameDetails = async () => {
      const game = await contractInstanceProvider.games(gameId);
      const startTime = Number(game.startTime);

      const betAmountInEther = ethers.formatEther(game.betAmount);
      setGameDetails({
        player1: game.player1,
        betAmount: betAmountInEther,
        betAmountRaw: game.betAmount
      });

      // Check if the current time is more than 15 minutes past the start time
      if (Date.now() / 1000 - startTime > 15 * 60) {
        setBetExpired(true);
        return;
      }

    };

    fetchGameDetails();
  }, [gameId, contractInstanceProvider]);

  useEffect(() => {
    const link = "http://localhost:3000/room/" + gameId.toString();
    setGeneratedLink(link);
  }, [gameId]);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setBetExpired(true);
    }, 900000);
  
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);
  

  const handleJoinGame = async () => {
    try {
      // Logic to join the game
      const gasLimit = 120000;
      const tx = await contractInstanceSigner.joinGame(gameId, { value: gameDetails.betAmountRaw, gasLimit: gasLimit });
      await tx.wait();
    } catch (error) {
      console.error("An error occurred while joining the game:", error);
    }
  };

  const handleWithdraw = async () => {
    try {
      const tx1 = await contractInstanceSigner.checkGameTimeout(gameId);
      await tx1.wait();  // Wait for the transaction to be confirmed

      // Then proceed with the withdrawal
      const tx2 = await contractInstanceSigner.withdraw();
      await tx2.wait();
      setWithdrawn(true);
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  return (
    <div>
      {gameDetails && gameId ? (
        <>
          <h2>Game Details</h2>
          <p>Bet Amount: {gameDetails.betAmount} ETH</p>
          <p>Player 1 Address: {gameDetails.player1}</p>
  
          {gameDetails.player1.toLowerCase() === account ? (
            <>
            <h2>Share the room link with someone</h2>
            
            <div className="link-section">
              <input type="text" readOnly value={generatedLink} />
            </div>
  
            <div className="bet-output-section">
              <div className="withdraw-section">
                <button
                  onClick={handleWithdraw}
                  disabled={!betExpired || withdrawn}
                  style={{
                    backgroundColor: betExpired && !withdrawn ? '#4CAF50' : 'gray'
                  }}
                >
                  Request Withdraw
                </button>
                {!withdrawn && (
                  <div className="tooltip-withdraw">
                    You can withdraw only once the bet has expired without the other user accepting, which takes 15 minutes.
                  </div>
                )}
              </div>
            </div>
          </>
          ) : (betExpired ? (
            <p>The bet has expired.</p>
          ) : account ? (
            <button onClick={handleJoinGame}>Accept</button>
          ) : (
            <button className="placeholder-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          ))}
        </>
      ) : (
        <p>Loading game details...</p>
      )}
    </div>
  );
}

export default AcceptBet;
