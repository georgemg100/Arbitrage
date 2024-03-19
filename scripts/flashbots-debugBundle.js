const { ethers } = require("hardhat");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");
const { Wallet, Contract } = require("ethers");
const provider = ethers.getDefaultProvider("mainnet");

//const common = require("./common.js");
const NETWORK = "mainnet";
const REPUTATION_KEY = process.env.REPUTATION_KEY;
const RELAY_ENDPOINT = "https://relay.flashbots.net";

// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
// This is an identifying key for signing payloads to establish reputation and whitelisting
const authSigner = new ethers.Wallet(
    REPUTATION_KEY,
    provider
  );
async function getFlashbotsProvider() {
    return await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        RELAY_ENDPOINT,
        NETWORK
    );

}

main();
async function main() {
    const blockNum = 15046745
    const bundleHash = "0x1a1769d45220cba2aa8c3dac46f2c7919ad73ede30bd123ae660ae88c378f59f"
    //await getConflictingBundle(blockNum, signedTransaction)
    await getBundleStats(blockNum, bundleHash)
}

async function getConflictingBundle(blockNum, signedTransaction) {
    const flashbotsProvider = await getFlashbotsProvider();
    const conflictingBundle = await flashbotsProvider.getConflictingBundle(
        signedTransaction,
        blockNum 
    );
    console.log(conflictingBundle);
}

async function getBundleStats(blockNum, bundleHash) {
    const flashbotsProvider = await getFlashbotsProvider();
    console.log(
        await flashbotsProvider.getBundleStats(bundleHash, blockNum)
    )
}

