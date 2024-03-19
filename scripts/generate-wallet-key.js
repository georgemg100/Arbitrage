const { ethers } = require("hardhat");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");
const { Wallet, Contract } = require("ethers");
const { builtinModules } = require("module");
//const provider = ethers.getDefaultProvider("mainnet");
//const provider = new ethers.providers.AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY)
const provider = new ethers.providers.JsonRpcProvider("https://3.236.126.116:8545")
console.log(Wallet.createRandom().privateKey);