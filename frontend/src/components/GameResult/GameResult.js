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

    // Create a provider instance to connect to a custom Ethereum node
    const provider = useMemo(() => {
        return new WebSocketProvider(
        `wss://delicate-crimson-dew.base-goerli.discover.quiknode.pro/3e739828ff34548682516310c83e2dbbb604b2b8/`
    );
    }, []);
    
    // Create a contract instance using the public provider
    const contractInstance = useMemo(() => {
        return new Contract(CONTRACT_ADDRESS, abiData.abi, provider);
    }, [provider]);

    // Create a contract instance using the signer
    const contractInstanceSigner = useMemo(() => {
        return new Contract(CONTRACT_ADDRESS, abiData.abi, signer);
    }, [signer]);
    
    useEffect(() => {
        if (!signer) {
            setLoading(true); 
            return;
        }
    
        setLoading(false);

        const fetchGameDetails = async () => {
            const game = await contractInstance.games(gameId);

            //const betAmountInEther = ethers.formatEther(game.betAmount);
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
    }, [gameId, contractInstance, signer, winner]);

    const handleWithdraw = async () => {
        try {
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
                <div className={"player player-1" + (winner === "Player 1 wins!" ? " winner" : " loser")} >
                    <h2>Player 1</h2>
                    <p>{gameDetails ? shortenAddress(gameDetails.player1) : "fetching"}</p>
                </div>
                <div className={"player player-2" + (winner === "Player 2 wins!" ? " winner" : " loser")} >
                    <h2>Player 2</h2>
                    <p>{gameDetails ? shortenAddress(gameDetails.player2) : "fetching"}</p>
                </div>
            </div>
            
            <CoinFlip winner={ winner } />

            {isWinner && (
                <button className="withdraw-button" onClick={handleWithdraw} disabled={withdrawn}>
                    {withdrawn ? "Withdrawn" : "Withdraw"}
                </button>
            )}</>) }
        </div>
    );
}

export default GameResult;
