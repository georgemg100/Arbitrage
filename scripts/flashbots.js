const { ethers } = require("hardhat");
const {FlashbotsBundleProvider,} = require("@flashbots/ethers-provider-bundle");
const { Wallet, Contract } = require("ethers");
const provider = ethers.getDefaultProvider("goerli");

const arbContractJSON = require("../artifacts/contracts/ArbContract.sol/ArbContract.json")
//const common = require("./common.js");
const dfs = require("./dfs.js");
const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");

const REPUTATION_KEY = '0xe9edb1ec4538b896f01333b8e77c0d7c6bb0f73f97f1b68c03eb24fcf6d1580a';
//const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
// This is an identifying key for signing payloads to establish reputation and whitelisting
const authSigner = new ethers.Wallet(
    REPUTATION_KEY,
    provider
  );
var wallet = new ethers.Wallet(process.env.PRIVATE_KEY_GOERLI);
const NETWORK_GOERLI = "goerli";
const GOERLI_RELAY_ENDPOINT = "https://relay-goerli.flashbots.net";
const MAINNET_RELAY_ENDPOINT = "https://relay.flashbots.net";
const ARB_CONTRACT_ADDRESS_GOERLI = 0x9457f52e58bdbae6461a82818061cf13f5d25ef2;
const ARB_CONTRACT_ADDRESS_GOERLI_2 = "0x21c69365afd6dc0381ab3165545e0f3ef102ad97";
const ARB_CONTRACT_ADDRESS_GOERLI_3 = "0x7c5bf2748DB90f0888f0916925C680E1544b7927";
const ETH_ADDRESS = "0xd915Db3Ce4801593E9557B4Ce93d55fd6d922E2a";
const CHAIN_ID_GOERLI = 5;
const CHAIN_ID_MAINNET = 1;
console.log(process.argv)
async function main() {
    const balance = await provider.getBalance(ETH_ADDRESS);
    console.log("wallet balance: " + balance);
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        GOERLI_RELAY_ENDPOINT,
        NETWORK_GOERLI
    );
    const arbContract = getArbContract();

    provider.on('block', async (blockNumber) => {
        const trades = await getTrades(arbContract);
        await executeTrades(trades, arbContract, blockNumber + 1);
    })
  //console.log(response.name);
}

async function testSimple() {
    const balance = await provider.getBalance(ETH_ADDRESS);
    console.log("wallet balance: " + balance);
    const flashbotsProvider = await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        GOERLI_RELAY_ENDPOINT,
        NETWORK_GOERLI
    );
    const arbContract = getArbContract();
    const abi = ["function mint(address dst, uint256 rawAmount)"];
    const iface = ethers.utils.Interface(abi);
    iface.encodeFunctionData('mint', [0xd915Db3Ce4801593E9557B4Ce93d55fd6d922E2a, 2]);
    //arbContract.interface.encodeFunctionData('getContractBalance');
}

async function testOwnableCall() {
    const balance = await provider.getBalance(ETH_ADDRESS);
    console.log(balance)
    wallet = wallet.connect(provider);
    var arbContract = new ethers.Contract(ARB_CONTRACT_ADDRESS_GOERLI_3, arbContractJSON.abi, wallet)//getArbContract();
    //arbContract.connect(wallet.si)
    //arbContract = arbContract.connect(provider);
    const gainLoss = await arbContract.getContractBalance({gasLimit: 3000000})
    /*const callData = await arbContract.interface.encodeFunctionData("getContractBalance")
    const transaction =
         {
            to: ARB_CONTRACT_ADDRESS_GOERLI_3,
            gasPrice: BigInt(13000000000),
            gasLimit: 50000,
            data: callData,
            chainId: CHAIN_ID_GOERLI,
            value: 0,
          }
    wallet.signTransaction(transaction);
    wallet = wallet.connect(provider);
    const tx = await wallet.sendTransaction(transaction)
    console.log(tx);*/

    console.log("owner addr: " + gainLoss)
}

async function getTrades(arbContract) {
    const tokenMap = common.createTokenMap(pairs);
    const tradesCycles = dfs.findArbs(tokenMap);
    await common.updateReserves4(tradesCycles, arbContract);
    const trades = common.getProfitableTrades(tradesCycles);
    common.sortTrades(trades);
    return trades;
}

async function executeTrades(trades, arbContract, targetBlock) {
    for(var i = 0; i < 5; i++) {
        if(!trades[i]) continue;
          total++;
        await common.updateReserves4([trades[i].tradeCycle], arbContract);
        var EaEb = common.getEaEb8(trades[i].tradeCycle);
        if(!EaEb || EaEb[0] > EaEb[1]) continue;
        var optimalInput = common.getOptimalInput5(EaEb, trades[i].tradeCycle[0].feeNumerator, trades[i].tradeCycle[0].feeDenominator);
        var optimalProfit = common.getOptimalProfit8(trades[i].tradeCycle, optimalInput);
        trades[i].EaEb = EaEb;
        trades[i].optimalInput = optimalInput;
        trades[i].optimalProfit = optimalProfit;
        common.getOptimalProfitUSD(optimalProfit, trades[i].tradeCycle.startToken, trades[i])
        //trades[i].tradeCycle = undefined;
        if(EaEb[0] < EaEb[1] && optimalProfit > 0) {
            console.log(trades[i]);
            //console.log("exchangeToFeesPath: " + JSON.stringify(trades[i].exchangeToFeesPath))
            console.log("exchangeToTradePath: " + JSON.stringify(trades[i].exchangeToTradePath))
            const balanceBefore = await ethers.getDefaultProvider().getBalance(ETH_ACCOUNT);
            console.log("wallet balance before: " + balanceBefore);
            console.log("block: " + blockNumber);
            const callData = getCallData(trades, i, arbContract);
            const signedTransactions = await flashbotsProvider.signBundle([
                {
                  signer: wallet,
                  transaction: {
                    to: arbContract.address,
                    gasPrice: 13,
                    gasLimit: 30000,
                    data: callData,
                    chainId: CHAIN_ID_GOERLI,
                    value: 0,
                  },
                }
            ]);
            const bundleSubmission = flashbotsProvider.sendRawBundle(
                signedTransactions,
                targetBlock
              );
              console.log("submitted for block # ", targetBlock);
        }
    }
}
//testSimple();
testOwnableCall();
//main()

const PERCENT_TO_COINBASE = 9600;
function getCallData(trades, i, arbContract) {
    //const interface = ethers.utils.Interface(arbContractJSON.abi);
    const functionData = arbContract.interface.encodeFunctionData('callLendingPool',
        [
            [trades[i].path[0]],
            [BigInt(Math.floor(trades[i].optimalInput))],
            trades[i].exchangeToTradePath,
            common.getAllPaths(trades[i].exchangeToTradePath),
            common.getAllExchanges(trades[i].exchangeToTradePath),
            common.getAllFees(trades[i].exchangeToFeesPath),
            common.getAllPools(trades[i].exchangeToPoolsPath),
            PERCENT_TO_COINBASE
        ]);
    return functionData;
}

function getCallDataContractBalance() {
    const ABI = [
        "function getContractBalance() returns (uint256)"
    ];
    const interface = ethers.utils.Interface(ABI);
    const functionData = interface.encodeFunctionData('getContractBalance');
    return functionData;
}

function getArbContract() {
    return  new ethers.Contract(ARB_CONTRACT_ADDRESS_GOERLI_3, arbContractJSON.abi, provider);
}
/*
encode function call for transaction
let ABI = [
    "function transfer(address to, uint amount)"
];
> let iface = new ethers.utils.Interface(ABI);
> iface.encodeFunctionData("transfer", [ "0x1234567890123456789012345678901234567890", parseEther("1.0") ])
*/