import React from 'react';
import { useParams } from 'react-router-dom';
import CoinFlip from '../CoinFlip/CoinFlip';

function GameResult({ player1Address, player2Address, winnerAddress, onCollect }) {
    const { id: gameId } = useParams();
    const isPlayer1Winner = player1Address === winnerAddress;

    return (
        <div className="game-result-container">
            <div className="players">
                <div className="player">
                    <h2>Player 1</h2>
                    <p>{"player1Address.slice(0, 6)}...{player1Address.slice(-4)"}</p>
                </div>
                <div className="player">
                    <h2>Player 2</h2>
                    <p>{"player2Address.slice(0, 6)}...{player2Address.slice(-4)"}</p>
                </div>
            </div>
            
            <CoinFlip />

            <div className="announcement">
                <h2>Winner: {isPlayer1Winner ? "Player 1" : "Player 2"}</h2>
            </div>

            {winnerAddress === "/* Your user's address */" && (
                <button onClick={onCollect}>Collect Winnings</button>
            )}
        </div>
    );
}

export default GameResult;
