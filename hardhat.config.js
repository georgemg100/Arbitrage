require("@nomiclabs/hardhat-waffle");
require("hardhat-tracer");


// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

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
        blockNumber: 14874660
      }
    },
    localhost: {
      url: "http://127.0.0.1:8545"
    },
    mainnet: {
      url: "https://eth-mainnet.alchemyapi.io/v2/3aX4C7z0ix_3AkdmdFep5Bagm-hN5AW6"
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
      }
    ],
  }
};
