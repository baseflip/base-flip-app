import React, { useContext } from 'react';
import './Header.css';
import EthereumContext from '../../EthereumContext';
import { useWalletConnection } from '../../hooks/useWalletConnection';

function Header() {
  const { account, setAccount, setSigner } = useContext(EthereumContext);

  // Pass the setAccount and setSigner functions to custom wallet connect hook
  const { connectWallet, disconnectWallet, error } = useWalletConnection(setAccount, setSigner);

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
