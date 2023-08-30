import React, { useMemo, useEffect, useState, useContext } from 'react';
import { WebSocketProvider, Contract } from 'ethers';
import { useLocation } from 'react-router-dom';
import abiData from '../../abi.json';
import CoinFlip from '../CoinFlip/CoinFlip';
import EthereumContext from '../../EthereumContext';
import './GameResult.css';

const CONTRACT_ADDRESS = "0x70751cF31d8f31d6622760D243F5E4e150efb20b";

function GameResult() {
    const [isWinner, setIsWinner] = useState(false);
    const location = useLocation();
    const [gameDetails, setGameDetails] = useState(null);
    const { signer } = useContext(EthereumContext);
    const { winner, gameId } = location.state;
    const [loading, setLoading] = useState(true);
    const [withdrawn, setWithdrawn] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [explode, setExplode] = useState(false);
    const [dollarPositions, setDollarPositions] = useState([]);

    const provider = useMemo(() => {
        return new WebSocketProvider(
        `wss://delicate-crimson-dew.base-goerli.discover.quiknode.pro/${process.env.REACT_APP_PROVIDER_API_KEY}/`
    );
    }, []);
    
    const contractInstance = useMemo(() => {
        return new Contract(CONTRACT_ADDRESS, abiData.abi, provider);
    }, [provider]);

    const contractInstanceSigner = useMemo(() => {
        return new Contract(CONTRACT_ADDRESS, abiData.abi, signer);
    }, [signer]);

    const generateSpacedPositions = (count, minDistance = 30) => {
        const positions = [];
        for (let i = 0; i < count; i++) {
        let newPoint;
        let tooClose;
        do {
            tooClose = false;
            newPoint = {
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
            };
            for (const point of positions) {
            const distance = Math.sqrt(
                Math.pow(parseFloat(newPoint.top) - parseFloat(point.top), 2) +
                Math.pow(parseFloat(newPoint.left) - parseFloat(point.left), 2)
            );
            if (distance < minDistance) {
                tooClose = true;
                break;
            }
            }
        } while (tooClose);
        positions.push(newPoint);
        }
        return positions;
    };
    
    useEffect(() => {
        if (!signer) {
            setLoading(true); 
            return;
        }
    
        setLoading(false);

        const fetchGameDetails = async () => {
            const game = await contractInstance.games(gameId);

            setGameDetails({
                player1: game.player1,
                player2: game.player2,
            });

            const playerAddress = await signer.getAddress();
            if(winner === "Player 1 wins!") {
                if(playerAddress === game.player1) {
                    setIsWinner(true);
                }
            } else if(winner === "Player 2 wins!") {
                if(playerAddress === game.player2) {
                    setIsWinner(true);
                }
            }
        };

        fetchGameDetails();

        const timer = setTimeout(() => {
            setShowResults(true);
        }, 2000);

        return () => clearTimeout(timer);
    }, [gameId, contractInstance, signer, winner]);

    const handleWithdraw = async () => {
        try {
            setExplode(true);

            // Generate spaced out positions for dollar signs
            const positions = generateSpacedPositions(5);
            setDollarPositions(positions);

            // Reset the explosion after the animation
            setTimeout(() => setExplode(false), 1500);

            const tx = await contractInstanceSigner.withdraw();
            await tx.wait();
            setWithdrawn(true);
        } catch (error) {
            console.error("An error occurred while trying to withdraw:", error);
        }
    };

    const shortenAddress = (address) => {
        if (!address) return "";
        return address.slice(0, 6) + "..." + address.slice(-4);
    };

    return (

        <div className="game-result-container">
            { loading ? ( 
            <p>Loading game details...</p>
            ) : (
                <>
            <div className="players">
                <div className={"player player-1" + (showResults ? (winner === "Player 1 wins!" ? " winner" : " loser") : "")} >
                    <h2>Player 1</h2>
                    <p>{gameDetails ? shortenAddress(gameDetails.player1) : "fetching"}</p>
                </div>
                <div className={"player player-2" + (showResults ? (winner === "Player 2 wins!" ? " winner" : " loser") : "")} >
                    <h2>Player 2</h2>
                    <p>{gameDetails ? shortenAddress(gameDetails.player2) : "fetching"}</p>
                </div>
            </div>
            
            <CoinFlip winner={ winner } />

            {isWinner && showResults && (
               <button 
                className="withdraw-button" 
                onClick={handleWithdraw} 
                disabled={withdrawn}
                >
                    {withdrawn ? "Withdrawn" : "Withdraw"}
                    {explode && dollarPositions.map((pos, index) => (
                        <div key={index} className="dollar-sign" style={pos}>$</div>
                    ))}
                </button>
            )}</>) }
        </div>
    );
}

export default GameResult;
