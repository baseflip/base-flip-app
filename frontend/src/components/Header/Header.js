import React, { useState, useEffect, useContext } from 'react';
import './Header.css';
import { BrowserProvider } from 'ethers';
import EthereumContext from '../../EthereumContext';

function Header() {
  const [error, setError] = useState(null); 
  const { account, signer, setAccount, setSigner } = useContext(EthereumContext);

  const BASE_GOERLI_CHAIN_ID = '0x14a33';

  useEffect(() => {
    if (typeof window.ethereum !== 'undefined') {
      // Event listener for network changes
      window.ethereum.on('chainChanged', async (chainId) => {
        if (chainId !== BASE_GOERLI_CHAIN_ID) {
          setError('Please connect to the Base Goerli testnet in your wallet.');
        } else {
          setError(null);
        }
      });

      // Event listener for account changes
      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          // MetaMask is locked or the user has not connected any accounts
          setError('Please connect to MetaMask.');
          setAccount(null);
        } else {
          // Set the new account
          setAccount(accounts[0]);
        }
      });
    }

    // Cleanup the event listeners on component unmount
    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
  
        const browserProvider = new BrowserProvider(window.ethereum);
        const signerInstance = browserProvider.getSigner(0);
        console.log("Signer in Header.js:", signerInstance);
        console.log("Account in Header.js:", account);
  
        // Resolve the signer and then set it in the context
        const resolvedSigner = await signerInstance;
        setSigner(resolvedSigner);
  
        const chainId = await window.ethereum.request({ method: 'eth_chainId' });
        if (chainId !== BASE_GOERLI_CHAIN_ID) {
          setError('Please connect to the Base Goerli testnet in your wallet.');
          return;
        }
      } else {
        setError('Ethereum provider not detected. Please install MetaMask.');
      }
    } catch (error) {
      setError('Failed to connect wallet. Please try again.');
    }
  };
  

  // Function to handle wallet disconnection
  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
    window.location.reload();
  };

  // Function to shorten the displayed address
  const shortenAddress = (address) => {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  return (
    <header className="header">
      <div className="logo-section">
        {/* Placeholder */}
        <div className="placeholder-logo"></div>
        <h1>BaseFlip</h1>
      </div>
      <div className="button-section">
        {error && <p style={{ color: 'red' }}>{error}</p>}
        {account ? (
          <>
            <p>Connected: {shortenAddress(account)}</p>
            <button className="placeholder-button" onClick={disconnectWallet}>
              Disconnect Wallet
            </button>
          </>
        ) : (
          <button className="placeholder-button" onClick={connectWallet}>
            Connect Wallet
          </button>
        )}
      </div>
    </header>
  );
}

export default Header;
