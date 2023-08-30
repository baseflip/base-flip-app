import { ethers, deployments } from "hardhat";
import { expect } from "chai";
import { Contract } from "ethers";

describe("BaseFlip", function () {
  let BaseFlip: Contract;
  let owner: any;
  let addr1: any;
  let addr2: any;
  let addrs: any;

  beforeEach(async function () {
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    // Reset deployments to a clean state
    await deployments.fixture(['DeployAll']);

    // Get the deployment information for BaseFlip
    const BaseFlipDeployment = await deployments.get('BaseFlip');

    // Connect to the deployed contract
    BaseFlip = await ethers.getContractAt("BaseFlip", BaseFlipDeployment.address);
  });

  it("Should start a new game correctly", async function () {
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    const game = await BaseFlip.games(0);
    expect(game.player1).to.equal(addr1.address);
    expect(game.betAmount).to.equal(ethers.utils.parseEther("1"));
    expect(game.currentState).to.equal(1);
  });

  it("Should not allow to start a game with incorrect bet amount", async function () {
    await expect(BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("0.5") })).to.be.revertedWith("Sent ether should be equal to bet amount");
  });

  it("Should join a game correctly", async function () {
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    await BaseFlip.connect(addr2).joinGame(0, { value: ethers.utils.parseEther("1") });
    const game = await BaseFlip.games(0);
    expect(game.player2).to.equal(addr2.address);
    expect(game.currentState).to.equal(2);
  });

  it("Should not allow to join a game with incorrect bet amount", async function () {
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    await expect(BaseFlip.connect(addr2).joinGame(0, { value: ethers.utils.parseEther("0.5") })).to.be.revertedWith("Sent ether should be equal to bet amount");
  });

  it("Should set the fee percent correctly", async function () {
    await BaseFlip.connect(owner).setFeePercent(10);
    expect(await BaseFlip.feePercent()).to.equal(10);
  });

  it("Should not allow non-owner to set the fee percent", async function () {
    await expect(BaseFlip.connect(addr1).setFeePercent(10)).to.be.revertedWith("Caller is not the owner");
  });

  it("Should set the time limit correctly", async function () {
    await BaseFlip.connect(owner).setTimeLimit(600);
    expect(await BaseFlip.timeLimit()).to.equal(600);
  });

  it("Should not allow non-owner to set the time limit", async function () {
    await expect(BaseFlip.connect(addr1).setTimeLimit(600)).to.be.revertedWith("Caller is not the owner");
  });

  it("Should not allow to join a game after the time limit", async function () {
    await BaseFlip.connect(owner).setTimeLimit(1);
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await expect(BaseFlip.connect(addr2).joinGame(0, { value: ethers.utils.parseEther("1") })).to.be.revertedWith("Time limit for joining the game has passed");
  });

  it("Should refund the first player's bet if the game times out", async function () {
    await BaseFlip.connect(owner).setTimeLimit(1);
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    await new Promise(resolve => setTimeout(resolve, 2000));
    await BaseFlip.connect(addr1).checkGameTimeout(0);
    expect(await BaseFlip.pendingWithdrawals(addr1.address)).to.equal(ethers.utils.parseEther("1"));
  });

  it("Should reset a game correctly", async function () {
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    await BaseFlip.connect(addr2).joinGame(0, { value: ethers.utils.parseEther("1") });
    await BaseFlip.connect(addr1).resetGame(0);
    const game = await BaseFlip.games(0);
    expect(game.player1).to.equal(ethers.constants.AddressZero);
    expect(game.player2).to.equal(ethers.constants.AddressZero);
    expect(game.betAmount).to.equal(0);
    expect(game.currentState).to.equal(0);
  });

  it("Should not allow non-player to reset a game", async function () {
    await BaseFlip.connect(addr1).startGame(ethers.utils.parseEther("1"), { value: ethers.utils.parseEther("1") });
    await BaseFlip.connect(addr2).joinGame(0, { value: ethers.utils.parseEther("1") });
    await expect(BaseFlip.connect(owner).resetGame(0)).to.be.revertedWith("Only a player of the game can reset it");
  });
});