const { ethers } = require("hardhat");
const {FlashbotsBundleProvider,} = require("@flashbots/ethers-provider-bundle");
const { Wallet, Contract } = require("ethers");
const provider = ethers.getDefaultProvider("mainnet");

const arbContractJSON = require("../artifacts/contracts/ArbContract.sol/ArbContract.json")
const common = require("./common.js");
const dfs = require("./dfs.js");
const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");

const REPUTATION_KEY = process.env.REPUTATION_KEY;
//const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
// This is an identifying key for signing payloads to establish reputation and whitelisting
const authSigner = new ethers.Wallet(
    REPUTATION_KEY,
    provider
  );
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

var wallet = new ethers.Wallet(PRIVATE_KEY_MAINNET);

async function main() {
    const balance = await provider.getBalance(ETH_ADDRESS);
    console.log("wallet balance: " + balance);
    const flashbotsProvider = await getFlashbotsProvider();
    const arbContract = getArbContract();
 
    provider.on('block', async (blockNumber) => {
        console.log(provider.listenerCount())
        const trades = await getTrades(arbContract);
        if(trades && trades[0]) console.log(trades[0]);
        //await executeTrades(trades, arbContract, blockNumber + 1);
    })
  //console.log(response.name);
}

async function testSimple() {
    const balance = await provider.getBalance(ETH_ADDRESS);
    console.log("wallet balance: " + balance);
    const flashbotsProvider = getFlashbotsProvider();
    const arbContract = getArbContract();
    const abi = ["function mint(address dst, uint256 rawAmount)"];
    const iface = ethers.utils.Interface(abi);
    iface.encodeFunctionData('mint', [0xd915Db3Ce4801593E9557B4Ce93d55fd6d922E2a, 2]);
    //arbContract.interface.encodeFunctionData('getContractBalance');
}

async function testOwnableCall() {
    const flashbotsProvider = await getFlashbotsProvider();
    const balance = await provider.getBalance(ETH_ADDRESS);
    const feeData = await provider.getFeeData()
    console.log(balance)
    wallet = wallet.connect(provider);
    var arbContract = new ethers.Contract(ARB_CONTRACT_ADDRESS, arbContractJSON.abi, wallet)//getArbContract();
    var curBlock = await provider.getBlockNumber();
    //arbContract.connect(wallet.si)
    //arbContract = arbContract.connect(provider);
    //const gainLoss = await arbContract.getContractBalance({gasLimit: 3000000})
    const callData = await arbContract.interface.encodeFunctionData("getContractBalance")
    const signedTransactions = await flashbotsProvider.signBundle([
        {
        signer: wallet,
        transaction:
         {
            to: ARB_CONTRACT_ADDRESS,
            gasPrice: 13,
            gasLimit: 50000,
            data: callData,
            chainId: CHAIN_ID,
            value: 0,
          }
        }]);
    for(var i = 0; i < 10; i++) {
        const bundleSubmission = flashbotsProvider.sendRawBundle(
            signedTransactions,
            curBlock + i
            );
        console.log("bundle submitted block: " + (curBlock + i));
    }
    /*wallet.signTransaction(transaction);
    wallet = wallet.connect(provider);
    const tx = await wallet.sendTransaction(transaction)
    console.log(tx);*/

    //console.log("owner addr: " + gainLoss)
}

async function getFlashbotsProvider() {
    return await FlashbotsBundleProvider.create(
        provider,
        authSigner,
        RELAY_ENDPOINT,
        NETWORK
    );
}

function getProfitMinusGas() {
    
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
            const feeData = await provider.getFeeData()
            await simulateTransaction(signedTransactions, targetBlock);
            /*const signedTransactions = await flashbotsProvider.signBundle([
                {
                  signer: wallet,
                  transaction: {
                    to: arbContract.address,
                    gasPrice: feeData.gasPrice,
                    gasLimit: 400000,
                    data: callData,
                    chainId: CHAIN_ID,
                    value: 0,
                  },
                }
            ]);
            const bundleSubmission = flashbotsProvider.sendRawBundle(
                signedTransactions,
                targetBlock
              );*/
              console.log("submitted for block # ", targetBlock);
        }
    }
}
//testSimple();
//testOwnableCall();
main()

const PERCENT_TO_COINBASE = 9600;
async function simulateTransaction(signedTransactions, targetBlock) {
    const flashbotsProvider = getFlashbotsProvider();
    const simulation = await flashbotsProvider.simulate(
        signedTransactions,
        targetBlock
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
}

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
    return  new ethers.Contract(ARB_CONTRACT_ADDRESS, arbContractJSON.abi, provider);
}

async function timeout(time) {
    await new Promise((res, rej) => {
        setTimeout(() => {
          res('foo');
          console.log("foo")
        }, time)
      });
}
/*
encode function call for transaction
let ABI = [
    "function transfer(address to, uint amount)"
];
> let iface = new ethers.utils.Interface(ABI);
> iface.encodeFunctionData("transfer", [ "0x1234567890123456789012345678901234567890", parseEther("1.0") ])
*/