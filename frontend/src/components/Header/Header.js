import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import EthereumContext from '../../EthereumContext';
import { useWalletConnection } from '../../hooks/useWalletConnection';

function Header() {
  const { account, error, setAccount, setSigner } = useContext(EthereumContext);
  const navigate = useNavigate();

  // Pass the setAccount and setSigner functions to custom wallet connect hook
  const { connectWallet, disconnectWallet } = useWalletConnection(setAccount, setSigner);

  // Function to shorten the displayed address
  const shortenAddress = (address) => {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  // Function to navigate to homepage
  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo-section" onClick={goToHomePage}>
        {/* Placeholder */}
        <div className="placeholder-logo"></div>
        <h1><span className="base">BASE</span><span className="flip">flip</span></h1>
      </div>
      <div className="button-section">
        {error && <p className="connected-wallet-error">{error}</p>}
        {account ? (
          <>
            <p className="connected-wallet">Connected: {shortenAddress(account)}</p>
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
