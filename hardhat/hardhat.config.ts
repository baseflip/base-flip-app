import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "hardhat-deploy";
import * as dotenv from "dotenv";

dotenv.config();

const config: HardhatUserConfig = {
  solidity: "0.8.17",
  namedAccounts: {
    deployer: 0
  },
  networks: {
    base_goerli: {
      url: "https://goerli.base.org",
      accounts: [process.env.PRIVATE_KEY ?? ""]
    },
    base_mainnet: {
      url: "https://mainnet.base.org",
      accounts: [process.env.PRIVATE_KEY ?? ""]
    },
  }
};

export default config;
