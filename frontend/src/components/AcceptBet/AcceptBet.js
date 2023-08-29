import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ethers, WebSocketProvider, Contract } from 'ethers';
import abiData from '../../abi.json';
import EthereumContext from '../../EthereumContext';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import './AcceptBet.css';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";

function AcceptBet() {
  const { account, signer, setAccount, setSigner } = useContext(EthereumContext);
  const { connectWallet } = useWalletConnection(setAccount, setSigner);
  const [gameDetails, setGameDetails] = useState(null);
  const [betExpired, setBetExpired] = useState(false);
  const { gameId } = useParams();
  const [withdrawalStatus, setWithdrawalStatus] = useState(null);
  const [withdrawn, setWithdrawn] = useState(false);
  const [generatedLink, setGeneratedLink] = useState('');
  const [showCopyPopup, setShowCopyPopup] = useState(false);
  const linkInputRef = useRef(null);
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
      setWithdrawalStatus('Processing withdrawal, you will be asked to sign 2 transactions.');
      
      const tx1 = await contractInstanceSigner.checkGameTimeout(gameId);
      await tx1.wait();  // Wait for the transaction to be confirmed
  
      // Then proceed with the withdrawal
      const tx2 = await contractInstanceSigner.withdraw();
      await tx2.wait();
      
      setWithdrawalStatus('Successfully withdrawn');
      setWithdrawn(true);
    } catch (error) {
      console.error("Error withdrawing:", error);
      setWithdrawalStatus('Failed to withdraw');
    }
  };

  const handleCopyLink = () => {
    // Copy the link to clipboard
    const linkInput = linkInputRef.current;
    linkInput.select();
    document.execCommand('copy');
  
    // Show the "Link copied!" popup
    setShowCopyPopup(true);
  
    // Hide the popup after 2 seconds
    setTimeout(() => {
      setShowCopyPopup(false);
    }, 1000);
  };

  return (
    <div className="acceptbet-container">
      {gameDetails && gameId ? (
        <>
          <h2 className="acceptbet-heading">Game #{gameId}</h2>
          <p className="acceptbet-amount">Bet Amount: {gameDetails.betAmount} ETH</p>
          <p className="acceptbet-info">Player 1 Address: {gameDetails.player1}</p>
          <div className="divider"></div>
  
          {gameDetails.player1.toLowerCase() === account ? (
            <>
              <div className="link-section">
                <button className="link-copy" onClick={handleCopyLink}>Copy</button>
                {showCopyPopup && (
                  <div className="copy-popup">
                    Copied!
                  </div>
                )}
                <input type="text" readOnly value={generatedLink} className="acceptbet-info" ref={linkInputRef}/>
              </div>

              <div className="withdraw-section">
                <button
                  onClick={handleWithdraw}
                  disabled={!betExpired || withdrawn}
                  className={betExpired && !withdrawn ? "withdrawbet-button" : "withdrawbet-button-disabled"}
                >
                  Withdraw
                </button>
                {!withdrawn && !betExpired && (
                  <div className="tooltip-withdraw">
                    You can withdraw only once the bet has expired without the other user accepting, which takes 15 minutes.
                  </div>
                )}
                {withdrawalStatus && (
                  <div className="withdrawal-status">
                    {withdrawalStatus}
                  </div>
                )}
              </div>
            </>
          ) : (betExpired ? (
            <p className="acceptbet-info">The bet has expired.</p>
          ) : account ? (
            <button onClick={handleJoinGame} className="acceptbet-button">Accept</button>
          ) : (
            <button className="connect-wallet-button" onClick={connectWallet}>
              Connect Wallet
            </button>
          ))}
        </>
      ) : (
        <p className="acceptbet-info">Loading game details...</p>
      )}
    </div>
  );
}

export default AcceptBet;
