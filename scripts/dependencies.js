const { ethers } = require("hardhat");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");
const { Wallet, Contract } = require("ethers");
const { builtinModules } = require("module");
const { Alchemy, Network } = require("alchemy-sdk");

//const provider = ethers.getDefaultProvider("mainnet");
//const provider = new ethers.providers.AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY)
const alchemyWebSocketUrl = "wss://eth-mainnet.g.alchemy.com/v2/3aX4C7z0ix_3AkdmdFep5Bagm-hN5AW6";

const provider = new ethers.providers.WebSocketProvider(alchemyWebSocketUrl);

//const provider = new ethers.providers.JsonRpcProvider("http://54.211.110.131:8545")
//const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545")
const PRIVATE_KEY_GOERLI = process.env.PRIVATE_KEY_GOERLI;
const PRIVATE_KEY_MAINNET = process.env.PRIVATE_KEY_MAINNET;
const NETWORK_GOERLI = "goerli";
const NETWORK_MAINNET = "mainnet";
const NETWORK = NETWORK_MAINNET;
const GOERLI_RELAY_ENDPOINT = "https://relay-goerli.flashbots.net";
const MAINNET_RELAY_ENDPOINT = "https://relay.flashbots.net";
const RELAY_ENDPOINT = MAINNET_RELAY_ENDPOINT;
const ARB_CONTRACT_ADDRESS_GOERLI = "0x7c5bf2748DB90f0888f0916925C680E1544b7927";
const ARB_CONTRACT_ADDRESS_MAINNET = "0x23949E4E396696DFf7419168A60c943F4334Ac2A";
const ARB_CONTRACT_ADDRESS = ARB_CONTRACT_ADDRESS_MAINNET
const ETH_ADDRESS_MAINNET = "0xB48d0E729af1BF233ef69f046b85FdFb212dfc55"
const ETH_ADDRESS_GOERLI = "0xd915Db3Ce4801593E9557B4Ce93d55fd6d922E2a"
const ETH_ADDRESS = ETH_ADDRESS_MAINNET;
const CHAIN_ID_GOERLI = 5;
const CHAIN_ID_MAINNET = 1;
const CHAIN_ID = CHAIN_ID_MAINNET;
const REPUTATION_KEY = process.env.REPUTATION_KEY
const arbContractJSON = require("../artifacts/contracts/ArbContract.sol/ArbContract.json")
//import dotenv from "dotenv";

const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET, // Replace with your network.
  };

let wallet = new Wallet(PRIVATE_KEY_MAINNET);


const alchemy = new Alchemy(settings);

//dotenv.config();
//const { API_KEY, PRIVATE_KEY } = process.env;

// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
// This is an identifying key for signing payloads to establish reputation and whitelisting
//provider.pollingInterval = 100
const authSigner = new ethers.Wallet(
    REPUTATION_KEY,
    provider
  );

  console.log("provider: ")
  console.log(provider)

var walletEthers = new ethers.Wallet(PRIVATE_KEY_MAINNET, provider);

async function getFlashbotsProvider() {
    return await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        RELAY_ENDPOINT,
        NETWORK
    );
}

async function getLatestNonce() {
    
    const nonce = await walletEthers.getTransactionCount()//alchemy.core.getTransactionCount(wallet.address, "latest");
    return nonce
}

async function getMaxBaseFeeInFutureBlock(baseFeePerGas, targetBlock) {
    const maxBaseFeeInFutureBlock = FlashbotsBundleProvider.getMaxBaseFeeInFutureBlock(baseFeePerGas, targetBlock)
    return maxBaseFeeInFutureBlock

}

function getArbContract() {
    const arbContract = new ethers.Contract(ARB_CONTRACT_ADDRESS, arbContractJSON.abi, provider);
    return arbContract;
}

function getBaseFeeInNextBlock(baseFeePerGas, gasUsed, gasLimit) {
    return FlashbotsBundleProvider.getBaseFeeInNextBlock(baseFeePerGas, gasUsed, gasLimit)
}

async function sendPrivateTxAlchemy(rawTransaction) {
    const signedTx = await alchemy.transact.sendPrivateTransaction(
        rawTransaction,
        (await alchemy.core.getBlockNumber()) + 1
      );
      console.log("signedTransaction response alchemy: " + JSON.stringify(signedTrx))
      
}

module.exports.getFlashbotsProvider = getFlashbotsProvider;
module.exports.getArbContract = getArbContract;
module.exports.provider = provider;
module.exports.ethers = ethers;
module.exports.wallet = wallet
module.exports.getBaseFeeInNextBlock = getBaseFeeInNextBlock
module.exports.sendPrivateTxAlchemy = sendPrivateTxAlchemy;
module.exports.getLatestNonce = getLatestNonce;
module.exports.getMaxBaseFeeInFutureBlock = getMaxBaseFeeInFutureBlock;
