import { useState, useEffect } from 'react';
import { BrowserProvider } from 'ethers';

const BASE_GOERLI_CHAIN_ID = '0x14a33';

export const useWalletConnection = (setAccount, setSigner) => {
  const [error, setError] = useState(null);

  useEffect(() => {
    const connectWalletFromLocalStorage = async () => {
      const connectedAddress = localStorage.getItem('connectedAddress');
      if (connectedAddress) {
        setAccount(connectedAddress);
        const browserProvider = new BrowserProvider(window.ethereum);
        const signerInstance = browserProvider.getSigner(0);
        const resolvedSigner = await signerInstance;
        setSigner(resolvedSigner);
      }
    };

    connectWalletFromLocalStorage();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', async (chainId) => {
        if (chainId !== BASE_GOERLI_CHAIN_ID) {
          setError('Please connect to the Base Goerli testnet in your wallet.');
        } else {
          setError(null);
        }
      });

      window.ethereum.on('accountsChanged', (accounts) => {
        if (accounts.length === 0) {
          setError('Please connect to MetaMask.');
          setAccount(null);
          localStorage.removeItem('connectedAddress');
        } else {
          setAccount(accounts[0]);
          localStorage.setItem('connectedAddress', accounts[0]);
        }
      });
    }

    return () => {
      if (typeof window.ethereum !== 'undefined') {
        window.ethereum.removeAllListeners('chainChanged');
        window.ethereum.removeAllListeners('accountsChanged');
      }
    };
  }, [setAccount, setSigner]);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const account = accounts[0];
        setAccount(account);
        localStorage.setItem('connectedAddress', account);

        const browserProvider = new BrowserProvider(window.ethereum);
        const signerInstance = browserProvider.getSigner(0);
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

  const disconnectWallet = () => {
    setAccount(null);
    setError(null);
    localStorage.removeItem('connectedAddress');
    window.location.reload();
  };

  return { connectWallet, disconnectWallet, error };
};
