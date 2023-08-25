import React, { useState, useContext, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Contract, WebSocketProvider } from 'ethers';
import { parseEther } from 'ethers/utils';
import abiData from '../../abi.json';
import EthereumContext from '../../EthereumContext';
import './Bet.css';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";

function Bet() {
  const [betAmount, setBetAmount] = useState('');
  const [generatedLink, setGeneratedLink] = useState('');
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [withdrawTimeout, setWithdrawTimeout] = useState(null);
  const [transactionStatus, setTransactionStatus] = useState('');
  const [gameId, setGameId] = useState(null);
  const [withdrawn, setWithdrawn] = useState(false);
  const { signer } = useContext(EthereumContext);
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

  const contractInstance = new Contract(CONTRACT_ADDRESS, abiData.abi, signer);
  
  useEffect(() => {
    // Listen to the "CoinFlipped" event
    const onCoinFlipped = (gameIdEvent, winner) => {
      console.log("hi from Bet.js");
      // Redirect to the "gameResult" component with the winner information
      if(gameIdEvent === gameId) {
        navigate('/game-result/' + gameId, { state: { winner, gameId } });
      }
    };
  
    contractInstanceProvider.on("CoinFlipped", onCoinFlipped);
    // return () => {
    //   contractInstanceProvider.off("CoinFlipped", onCoinFlipped);
    // };
  }, [contractInstanceProvider, navigate, gameId]);
  

  const handleDeposit = async () => {
    try {
      setTransactionStatus('pending');

      const amount = parseEther(betAmount);
      const tx = await contractInstance.startGame(amount, { value: amount });
      const receipt = await tx.wait();

      if (receipt.logs && receipt.logs.length > 0) {
          const parsedLog = contractInstance.interface.parseLog(receipt.logs[0]);
          const gameId = parsedLog.args[0];
          const link = "http://yourapp.com/room/" + gameId.toString();
          setGeneratedLink(link);
          setGameId(gameId);
      } else {
          console.error("Failed to retrieve gameId from the transaction receipt.");
      }

      setTransactionStatus('confirmed');

      const timeoutId = setTimeout(() => {
        setCanWithdraw(true);
      }, 900000);

      setWithdrawTimeout(timeoutId);

    } catch (error) {
        console.error("Error depositing:", error);
        setTransactionStatus('error');
    }
  };

  const handleWithdraw = async () => {
    try {
      // First, check if the game has timed out and update the game state if necessary
      await contractInstance.checkGameTimeout(gameId);
  
      // Then proceed with the withdrawal
      const tx = await contractInstance.withdraw();
      await tx.wait();
      setCanWithdraw(false);
      setWithdrawn(true);
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (withdrawTimeout) {
        clearTimeout(withdrawTimeout);
      }
    };
  }, [withdrawTimeout]);

  return (
    <div className="bet-container">
      {transactionStatus !== 'confirmed' ? (
        <>
          <div className="heading-section">
            <h2>Create a new bet and share it</h2>
            <div className="info-icon">
              ⓘ
              <div className="tooltip">Enter the desired bet size in the field below and click on deposit. After you've deposited your ETH, a link will be generated which you can share with your counterparty.</div>
            </div>
          </div>
          <div className="bet-input-section">
            <label>Enter desired amount of ETH to bet:</label>
            <input 
              type="number" 
              value={betAmount} 
              onChange={(e) => setBetAmount(e.target.value)} 
              placeholder="Bet amount" 
            />
            <button onClick={handleDeposit}>Deposit</button>
          </div>
          {transactionStatus === 'pending' && <p>Awaiting transaction confirmation...</p>}
        </>
      ) : (
        <>
          <h2>Share the room link with someone</h2>
          
          <div className="link-section">
            <input type="text" readOnly value={generatedLink} />
          </div>

          <div className="bet-output-section">
            <p>
              {withdrawn ? "Deposit withdrawn" : `You've deposited: ${betAmount} ETH`}
            </p>
            <div className="withdraw-section">
              <button
                onClick={handleWithdraw}
                disabled={!canWithdraw || withdrawn} // Disable the button if already withdrawn
                style={{
                  backgroundColor: canWithdraw && !withdrawn ? '#4CAF50' : 'gray'
                }}
              >
                Withdraw
              </button>
              {!canWithdraw && !withdrawn && (
                <div className="tooltip-withdraw">
                  You can withdraw only once the bet has expired without the other user accepting, which takes 15 minutes.
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Bet;
