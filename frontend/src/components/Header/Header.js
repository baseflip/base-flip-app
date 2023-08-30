import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import './Header.css';
import EthereumContext from '../../EthereumContext';
import { useWalletConnection } from '../../hooks/useWalletConnection';
import logo from '../../assets/bflogo2.png';

function Header() {
  const { account, error, setAccount, setSigner } = useContext(EthereumContext);
  const navigate = useNavigate();
  const { connectWallet, disconnectWallet } = useWalletConnection(setAccount, setSigner);

  const shortenAddress = (address) => {
    if (!address) return "";
    return address.slice(0, 6) + "..." + address.slice(-4);
  };

  const goToHomePage = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="logo-section" onClick={goToHomePage}>
        <div className="image-container">
          <img src={logo} alt="BaseFlip Logo" className="logo-image" />
        </div>
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
