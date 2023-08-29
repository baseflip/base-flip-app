import { useEffect, useCallback } from 'react';
import { BrowserProvider } from 'ethers';
import { useContext } from 'react';
import EthereumContext from '../EthereumContext';

const BASE_GOERLI_CHAIN_ID = '0x14a33';

export const useWalletConnection = (setAccount, setSigner) => {
  const { setError } = useContext(EthereumContext);

  const checkChainId = useCallback(async () => {
    const chainId = await window.ethereum.request({ method: 'eth_chainId' });
    if (chainId !== BASE_GOERLI_CHAIN_ID) {
      setError('Switch to Base network.');
      return false;
    } else {
      setError(null);
      return true;
    }
  }, [setError]);

  useEffect(() => {
    const connectWalletFromLocalStorage = async () => {
      try {
        const connectedAddress = localStorage.getItem('connectedAddress');
        if (connectedAddress) {
          setAccount(connectedAddress);
          const browserProvider = new BrowserProvider(window.ethereum);
          const signerInstance = browserProvider.getSigner(0);
          const resolvedSigner = await signerInstance;
          setSigner(resolvedSigner);
    
          if (await checkChainId() === false) {
            return;
          }
        }
      } catch (error) {
        console.error("Error connecting wallet from local storage:", error);
      }
    };

    connectWalletFromLocalStorage();

    if (typeof window.ethereum !== 'undefined') {
      window.ethereum.on('chainChanged', async () => {
        await checkChainId();
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
  }, [setAccount, setSigner, checkChainId, setError]);

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

        if (await checkChainId() === false) {
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

  return { connectWallet, disconnectWallet };
};
