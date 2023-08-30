// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title BaseFlip
 * @dev A coin flip game where two players bet equal amounts of ether.
 * The winner is determined pseudo-randomly, and the winnings, minus a fee, are awarded to the winner.
 */
contract BaseFlip {
    enum GameState { WaitingForPlayer, GameStarted, GameOver }

    struct Game {
        address payable player1;
        address payable player2;
        uint betAmount;
        uint startTime;
        GameState currentState;
    }

    mapping(uint => Game) public games;
    mapping(address => uint) public pendingWithdrawals;
    uint public gameIdCounter;
    uint public constant feePercent = 5;
    uint public constant timeLimit = 15 minutes;
    uint public collectedFees;

    address public owner;

    event GameStarted(uint indexed gameId, address player);
    event PlayerJoined(uint indexed gameId, address player);
    event CoinFlipped(uint indexed gameId, string winner);
    event GameReset(uint indexed gameId);
    event Withdrawal(address indexed user, uint amount);

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Caller is not the owner");
        _;
    }

    modifier inState(uint gameId, GameState _state) {
        require(games[gameId].currentState == _state, "Current state does not allow this action");
        _;
    }

    function startGame(uint _betAmount) public payable {
        require(msg.value == _betAmount, "Sent ether should be equal to bet amount");

        games[gameIdCounter].player1 = payable(msg.sender);
        games[gameIdCounter].betAmount = _betAmount;
        games[gameIdCounter].startTime = block.timestamp;
        games[gameIdCounter].currentState = GameState.GameStarted;

        emit GameStarted(gameIdCounter, msg.sender);
        
        gameIdCounter++;
    }

    function joinGame(uint gameId) public payable inState(gameId, GameState.GameStarted) {
        require(msg.value == games[gameId].betAmount, "Sent ether should be equal to bet amount");
        require(block.timestamp <= games[gameId].startTime + timeLimit, "Time limit for joining the game has passed");

        games[gameId].player2 = payable(msg.sender);
        games[gameId].currentState = GameState.GameOver;
        emit PlayerJoined(gameId, msg.sender);

        determineWinner(gameId);
    }

    function determineWinner(uint gameId) private inState(gameId, GameState.GameOver) {
        bytes32 hashed = keccak256(abi.encodePacked(games[gameId].player1, games[gameId].player2, blockhash(block.number - 1)));
        uint randomNumber = uint(hashed) % 2;
        uint winnings = games[gameId].betAmount * 2;
        uint fee = winnings * feePercent / 100;

        winnings = winnings - fee;
        collectedFees += fee;

        string memory winningPlayer;

        if(randomNumber == 0) {
            pendingWithdrawals[games[gameId].player1] += winnings;
            winningPlayer = "Player 1 wins!";
        } else {
            pendingWithdrawals[games[gameId].player2] += winnings;
            winningPlayer = "Player 2 wins!";
        }

        emit CoinFlipped(gameId, winningPlayer);
    }

    function withdraw() public {
        uint amount = pendingWithdrawals[msg.sender];
        require(amount > 0, "No funds to withdraw");

        pendingWithdrawals[msg.sender] = 0;
        payable(msg.sender).transfer(amount);

        emit Withdrawal(msg.sender, amount);
    }

    function resetGame(uint gameId) public inState(gameId, GameState.GameOver) {
        require(msg.sender == games[gameId].player1 || msg.sender == games[gameId].player2, "Only a player of the game can reset it");

        games[gameId].player1 = payable(address(0));
        games[gameId].player2 = payable(address(0));
        games[gameId].betAmount = 0;
        games[gameId].startTime = 0;
        games[gameId].currentState = GameState.WaitingForPlayer;

        emit GameReset(gameId);
    }

    function checkGameTimeout(uint gameId) public inState(gameId, GameState.GameStarted) {
        require(block.timestamp > games[gameId].startTime + timeLimit, "Game has not yet timed out");

        pendingWithdrawals[games[gameId].player1] += games[gameId].betAmount;
        games[gameId].currentState = GameState.GameOver;

        resetGame(gameId);
    }

    function withdrawFees() public onlyOwner {
        uint fees = collectedFees;
        require(fees > 0, "No fees to withdraw");

        collectedFees = 0;
        payable(msg.sender).transfer(fees);
    }
}
