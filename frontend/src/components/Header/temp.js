import React, { useState, useContext, useEffect } from 'react';
import { Contract } from 'ethers';
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
  const [transactionStatus, setTransactionStatus] = useState('');  // New state variable

  // Use EthereumContext to get account and signer
  const { account, signer } = useContext(EthereumContext);
  console.log("Signer in Bet.js:", signer);
  console.log("Account in Bet.js:", account);

  // Create a contract instance using the signer from the context
  const contractInstance = new Contract(CONTRACT_ADDRESS, abiData.abi, signer);

  const handleDeposit = async () => {
    try {
      setTransactionStatus('pending');  // Set status to pending when transaction is sent

      // Convert the betAmount to the correct unit
      const amount = parseEther(betAmount);

      // Send the transaction to start the game
      const tx = await contractInstance.startGame(amount, {
          value: amount  // Send ether with the transaction
      });

      // Wait for the transaction to be mined
      const receipt = await tx.wait();

      // Parse the log to retrieve the gameId
      if (receipt.logs && receipt.logs.length > 0) {
          const parsedLog = contractInstance.interface.parseLog(receipt.logs[0]);
          const gameId = parsedLog.args[0];  // Assuming gameId is the first argument in the event
          console.log("Game ID:", gameId.toString());

          const link = "http://yourapp.com/room/" + gameId.toString();
          setGeneratedLink(link);
      } else {
          console.error("Failed to retrieve gameId from the transaction receipt.");
      }

      setTransactionStatus('confirmed');  // Set status to confirmed once transaction is mined

      // Set a timeout to enable the withdraw button after 1 minute
      const timeoutId = setTimeout(() => {
          setCanWithdraw(true);
      }, 60000);  // 60000 milliseconds = 1 minute

      // Store the timeout ID in state
      setWithdrawTimeout(timeoutId);

    } catch (error) {
        console.error("Error depositing:", error);
        setTransactionStatus('error');  // Set status to error if there's an exception
    }
  };

  const handleWithdraw = async () => {
    try {
      const tx = await contractInstance.withdraw();
      await tx.wait();
      setCanWithdraw(false);
    } catch (error) {
      console.error("Error withdrawing:", error);
    }
  };

  // Clear the timeout if the component is unmounted
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
          <div className="bet-output-section">
            <p>You've deposited: {betAmount} ETH</p>
            <button 
              onClick={handleWithdraw} 
              disabled={!canWithdraw}
              style={{ backgroundColor: canWithdraw ? '#4CAF50' : 'gray' }}
            >
              Withdraw
            </button>
          </div>
          <div className="link-section">
            <input type="text" readOnly value={generatedLink} />
          </div>
        </>
      )}
    </div>
  );
}

export default Bet;
