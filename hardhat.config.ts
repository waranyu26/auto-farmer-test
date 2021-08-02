import { task } from "hardhat/config";
import "@nomiclabs/hardhat-ethers";
import "@nomiclabs/hardhat-waffle";

import { BSCScanAPIKey, SpeedyNodesKey } from "./local.config";

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (args, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(await account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

export default {
  default: "hardhat",
  networks: {
    hardhat: {
      forking: {
        url: `https://speedy-nodes-nyc.moralis.io/${SpeedyNodesKey}/bsc/mainnet`,
      },
      mining: {
        auto: true,
        interval: 1000,
      },
    },
    local: {
      url: "http://localhost:8545",
    },
    bsc_mainnet: {
      url: "https://bsc-dataseed.binance.org/",
    },
    bsc_testnet: {
      url: "https://data-seed-prebsc-1-s1.binance.org:8545/",
    },
  },
  solidity: {
    version: "0.6.12",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200,
      },
    },
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts",
  },
  etherscan: {
    apiKey: BSCScanAPIKey,
  },
  gasReporter: {
    currency: "USD",
  },
};