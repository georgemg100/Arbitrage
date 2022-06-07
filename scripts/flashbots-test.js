const { ethers } = require("hardhat");
const {FlashbotsBundleProvider,} = require("@flashbots/ethers-provider-bundle");
const { Wallet } = require("ethers");
const provider = ethers.getDefaultProvider();
// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
  // This is an identifying key for signing payloads to establish reputation and whitelisting
const authSigner = new ethers.Wallet.createRandom;
const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

/*const signedBundle = await flashbotsProvider.signBundle([
    {
      signer: SOME_SIGNER_TO_SEND_FROM,
      transaction: SOME_TRANSACTION_TO_SEND,
    },
  ]);*/
async function testFlashbots() {
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner
    );

    //const ArbContract = await hre.ethers.getContractFactory("ArbContract");
    //constructor(ILendingPoolAddressesProvider provider, uint256 tokenId, uint256 nftVault, uint256 nftContract, uint256 nftType) public FlashLoanReceiverBase(provider) {
    //const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
    //await arbContract.deployed();
    //Wallet.
    //const response = await flashbotsProvider.detectNetwork()
    console.log(response.name);
}

testFlashbots()