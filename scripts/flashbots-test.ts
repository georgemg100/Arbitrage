const { ethers } = require("hardhat");
const {FlashbotsBundleProvider,} = require("@flashbots/ethers-provider-bundle");
const { Wallet } = require("ethers");
const provider = ethers.getDefaultProvider("goerli");
const arbContractJSON = require("../artifacts/contracts/ArbContract.sol/ArbContract.json")

//const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
// This is an identifying key for signing payloads to establish reputation and whitelisting
const authSigner = new ethers.Wallet(
    '0x2000000000000000000000000000000000000000000000000000000000000000',
    provider
  );
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY_GOERLI)
const NETWORK_GOERLI = "goerli";
const GOERLI_RELAY_ENDPOINT = "https://relay-goerli.flashbots.net";
const ArbContractAddr = 0xb7012CBa912fc8a2362dc46234cF4596D5884BD0;
const ARB_CONTRACT_GOERLI = "0xb7012CBa912fc8a2362dc46234cF4596D5884BD0";

async function main() {

    /*const signedBundle = await flashbotsProvider.signBundle([
        {
          signer: SOME_SIGNER_TO_SEND_FROM,
          transaction: SOME_TRANSACTION_TO_SEND,
        },
    ]);*/
    const balance = await provider.getBalance(ARB_CONTRACT_GOERLI);
    console.log("wallet balance: " + balance);
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        GOERLI_RELAY_ENDPOINT,
        NETWORK_GOERLI
    );
    var arbContract = getArbContract()
    var callData = arbContract.interface.encodeFunctionData("payMiner")
    const signedTransactions = await flashbotsProvider.signBundle([
        {
          signer: wallet,
          transaction: {
            to: ARB_CONTRACT_GOERLI,
            gasPrice: BigInt(13000000000),
            gasLimit: 43000,
            data: callData,
            chainId: 5,
            value: BigInt(5000000000000000),
          },
        }]);

    const blockNumber = await provider.getBlockNumber();
    console.log(new Date());
    const simulation = await flashbotsProvider.simulate(
        signedTransactions,
        blockNumber + 1
      );
    console.log(new Date());

    // Using TypeScript discrimination
  if ("error" in simulation) {
    console.log(`Simulation Error: ${simulation.error.message}`);
  } else {
    console.log(
      `Simulation Success: ${blockNumber} ${JSON.stringify(
        simulation,
        null,
        2
      )}`
    );
  }
  console.log(signedTransactions);
  for (var i = 1; i <= 10; i++) {
    const bundleSubmission = flashbotsProvider.sendRawBundle(
      signedTransactions,
      blockNumber + i
    );
    console.log("submitted for block # ", blockNumber + i);
  }
  console.log("bundles submitted");
  //console.log(response.name);
}

main()

function getArbContract() {
  const arbContract = new ethers.Contract(ARB_CONTRACT_GOERLI, arbContractJSON.abi, provider);
  return arbContract;
}
/*
encode function call for transaction
let ABI = [
    "function transfer(address to, uint amount)"
];
> let iface = new ethers.utils.Interface(ABI);
> iface.encodeFunctionData("transfer", [ "0x1234567890123456789012345678901234567890", parseEther("1.0") ])
*/