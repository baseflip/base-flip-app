import React, { useRef, useEffect } from 'react';
import './CoinFlip.css';

function CoinFlip() {
    const coinContainerRef = useRef(null);
    const coinMovementRef = useRef(null);

    const handleFlip = () => {
        const coinContainer = coinContainerRef.current;
        const coinMovement = coinMovementRef.current;

        const spins = 5;

        const degrees = spins * 360;

        const coinElement = coinContainer.querySelector('.coin');
        coinElement.style.transform = `rotateY(${degrees}deg)`;

        // Restart the flipInAir animation for the coin-movement container
        coinMovement.style.animation = 'none';
        setTimeout(() => {
            coinMovement.style.animation = '';
        }, 10);
    };

    // Use the useEffect hook to trigger the handleFlip function when the component mounts
    useEffect(() => {
        handleFlip();
    }, []);

    useEffect(() => {
        handleFlip();
        setTimeout(() => {
            const winnerAnnouncement = document.querySelector('.winner-announcement');
            winnerAnnouncement.style.transform = "translate(-50%, -50%) scale(1)";
            winnerAnnouncement.style.opacity = "1";
        }, 1500); // This delay should be slightly more than the coin flip animation duration
    }, []);

    return (
        <div className="coin-flip-wrapper">
            <div className="coin-container" ref={coinContainerRef}>
                <div className="coin-movement" ref={coinMovementRef}>
                    <div className="coin"></div>
                </div>
            </div>
            <div className="winner-announcement">
                Player 1 Wins!
            </div>
        </div>
    );
}

export default CoinFlip;
