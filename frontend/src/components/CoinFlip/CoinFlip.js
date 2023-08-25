import React, { useRef, useEffect } from 'react';
import './CoinFlip.css';

function CoinFlip({ winner }) {
  const coinContainerRef = useRef(null);
  const coinMovementRef = useRef(null);

  const handleFlip = () => {
    const coinContainer = coinContainerRef.current;
    const coinMovement = coinMovementRef.current;
  
    // apply the pre animation
    coinMovement.classList.add('prepare');
  
    // delay the main flip animation to allow the pre animation to complete
    setTimeout(() => {
      const spins = 5;
      const degrees = spins * 360;
  
      const coinElement = coinContainer.querySelector('.coin');
      coinElement.style.transform = `rotateY(${degrees}deg)`;
  
      coinMovement.style.animation = 'none';
      setTimeout(() => {
        coinMovement.style.animation = '';
        coinMovement.classList.remove('prepare');
      }, 50);
    }, 500); // match the duration of the pre animation
  };

  useEffect(() => {
    // ensure the component is fully rendered
    setTimeout(() => {
      handleFlip();
    }, 50);

    setTimeout(() => {
      const winnerAnnouncement = document.querySelector('.winner-announcement');
      winnerAnnouncement.style.transform = "translate(-50%, -50%) scale(1)";
      winnerAnnouncement.style.opacity = "1";
    }, 1900); // this delay should be slightly more than the coin flip animation duration
  }, []);

  return (
    <div className="coin-flip-wrapper">
      <div className="coin-container" ref={coinContainerRef}>
        <div className="coin-movement" ref={coinMovementRef}>
          <div className="coin"></div>
        </div>
      </div>
      <div className="winner-announcement">
        { winner }
      </div>
    </div>
  );
}

export default CoinFlip;
