require("@nomiclabs/hardhat-waffle");
require("hardhat-tracer");
require("hardhat-gas-reporter");
//require('dotenv').config({path:__dirname+'/.env'})
require('dotenv').config();

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const PRIVATE_KEY_GOERLI = process.env.PRIVATE_KEY_GOERLI
const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET
// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  networks: {
    hardhat: {
      forking: {
        url: "https://eth-mainnet.alchemyapi.io/v2/3aX4C7z0ix_3AkdmdFep5Bagm-hN5AW6",
        blockNumber: 19493256
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    mainnet: {
      url: "https://eth-mainnet.alchemyapi.io/v2/3aX4C7z0ix_3AkdmdFep5Bagm-hN5AW6",
      accounts: [PRIVATE_KEY_MAINNET]
    },
    goerli: {
      url: "https://eth-goerli.alchemyapi.io/v2/uGHfQaqCGiaGYQ3ewoZzdNgW3N3PJg4L",
      accounts: [PRIVATE_KEY_GOERLI]
    }
  },
  solidity: {
    compilers: [
      {
        version: "0.8.4",
      },
      {
        version: "0.6.12",
        settings: {},
      },
      {
        version: "0.7.6",
        settings: {},
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.7.5",
      },
      {
        version: "0.7.0",
      },
      {
        version: "0.8.10",
      }
    ],
  },
  gasReporter: {
    enabled: true//(process.env.REPORT_GAS) ? true : false
  },
  gas: 3000000,
  gasPrice: 3000000000,
};
