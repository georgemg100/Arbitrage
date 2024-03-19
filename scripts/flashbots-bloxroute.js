const dependencies = require("./dependencies.js")
//const { ethers } = require("hardhat");
const common = require("./common.js")
const CHAIN_ID = 1
const PERCENT_TO_COINBASE = 9650;
const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");
const dfs = require("./dfs.js");
var fs = require('fs');
const WebSocket = require('ws');

const tokenMap = common.createTokenMap(pairs);
const tradesCycles = dfs.findArbs(tokenMap);
const failedTrades = new Set()
//  Non Enterprise users should follow line 19-27
 const ws = new WebSocket(
   "wss://api.blxrbdn.com/ws", 
   {
     headers: { 
       "Authorization" : "MzdiNjVjMmItMGNhMS00MmE5LWEyZTMtYTgwMzFhZjhlYjExOmE2N2JhZDlmZmE4ODQyYjRjNzQzYzQ5MWQ2ZTMwNDc0"
     },
     rejectUnauthorized: false,
   }
 );

 function proceed() {
    // ETH Example
    ws.send(
        `{"jsonrpc": "2.0", "id": 1, "method": "subscribe", "params": ["newBlocks", {"include": ["header"]}]}`
    );
}


function handle(nextNotification) {
    console.log("nextNotification: ")
    console.log(nextNotification)
}

async function main() {
    //const balance = await provider.getBalance(ETH_ADDRESS);
    //console.log("wallet balance: " + balance);
    const flashbotsProvider = await getFlashbotsProvider();
    const arbContract = dependencies.getArbContract();
    ws.on('open', proceed);
    ws.on('message', handle);
    
    // dependencies.provider.on('block', async (blockNumber) => {
    //     console.log("block number: " + blockNumber)
    //     getTimestampUTC();
    //     //console.log("block received: " + new Date());
    //     const trades = await timeFunctionCall(getTrades, [arbContract])
    //     //const trades = await getTrades(arbContract);
    //     //getBaseFeeNextBlock(blockNumber + 1)
    //     await timeFunctionCall(executeTrades, [trades, arbContract, blockNumber + 1, flashbotsProvider])
    //     //await executeTrades(trades, arbContract, blockNumber + 1, flashbotsProvider);
    //     console.log("waiting for next block...")
        

    // })
  //console.log(response.name);
}

function getTimestampUTC() {
    var d = new Date();
    var utcDate = d.getUTCHours() + ":" + d.getUTCMinutes() + ":" + d.getUTCSeconds() + ":" + d.getUTCMilliseconds();
    console.log("block received at: " + utcDate);
    //return utcDate
}

async function timeFunctionCall(func, params) {
    const d = new Date();
    const start = d.getTime()
    const val = await func(...params)
    var d2 = new Date();
    const end = d2.getTime()
    console.log(func.name + " execution time: " +(end - start))
    return val;

}

async function testSimple() {
    //const balance = await provider.getBalance(ETH_ADDRESS);
    //console.log("wallet balance: " + balance);
    const flashbotsProvider = getFlashbotsProvider();
    const arbContract = dependencies.getArbContract();
    const abi = ["function mint(address dst, uint256 rawAmount)"];
    const iface = dependencies.ethers.utils.Interface(abi);
    iface.encodeFunctionData('mint', [0xd915Db3Ce4801593E9557B4Ce93d55fd6d922E2a, 2]);
    //arbContract.interface.encodeFunctionData('getContractBalance');
}

async function testOwnableCall() {
    const flashbotsProvider = await getFlashbotsProvider();
    //const balance = await provider.getBalance(ETH_ADDRESS);
    const feeData = await dependencies.provider.getFeeData()
    //console.log(balance)
    //wallet = wallet.connect(provider);
    var arbContract = dependencies.getArbContract();
    var curBlock = await dependencies.provider.getBlockNumber();
    //arbContract.connect(wallet.si)
    //arbContract = arbContract.connect(provider);
    //const gainLoss = await arbContract.getContractBalance({gasLimit: 3000000})
    
    const callData = await arbContract.interface.encodeFunctionData("getContractBalance")
    const signedTransactions = await flashbotsProvider.signBundle([
        {
        signer: dependencies.wallet,
        transaction:
        {
            to: arbContract.address,
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
    return dependencies.getFlashbotsProvider()
}

async function getTrades(arbContract) {
    //await common.updateReserves4(tradesCycles, arbContract);
    await timeFunctionCall(common.updateReserves4, [tradesCycles, arbContract])
    const trades = common.getProfitableTrades(tradesCycles);
    common.sortTrades(trades);
    return trades;
}

async function executeTrades(trades, arbContract, targetBlock, flashbotsProvider) {
    var randIdx = Math.floor(Math.random() * Math.min(trades.length, 2));
    console.log("failedTrades size: " + failedTrades.size)
    for(var i = 0; i < trades.length; i++) {
        if(!trades[i]) continue;
        if(failedTrades.has(JSON.stringify(trades[i].path))) continue;
        //await timeFunctionCall(common.updateReserves4, [[trades[i].tradeCycle], arbContract])
        //await common.updateReserves4([trades[i].tradeCycle], arbContract);
        //var EaEb = common.getEaEb8(trades[i].tradeCycle);
        var EaEb = await timeFunctionCall(common.getEaEb8, [trades[i].tradeCycle])
        if(!EaEb || EaEb[0] > EaEb[1]) continue;
        //var optimalInput = common.getOptimalInput5(EaEb, trades[i].tradeCycle[0].feeNumerator, trades[i].tradeCycle[0].feeDenominator);
        var optimalInput = await timeFunctionCall(common.getOptimalInput5, [EaEb, trades[i].tradeCycle[0].feeNumerator, trades[i].tradeCycle[0].feeDenominator])
        if(optimalInput < 0) continue;
        //var optimalProfit = common.getOptimalProfit8(trades[i].tradeCycle, optimalInput);
        var optimalProfit = await timeFunctionCall(common.getOptimalProfit8, [trades[i].tradeCycle, optimalInput]) 
        trades[i].EaEb = EaEb;
        trades[i].optimalInput = optimalInput;
        trades[i].optimalProfit = optimalProfit;
        common.getOptimalProfitUSD(optimalProfit, trades[i].tradeCycle.startToken, trades[i])
        //trades[i].tradeCycle = undefined;
        if(EaEb[0] < EaEb[1] && optimalProfit > 0) {
            //console.log("exchangeToFeesPath: " + JSON.stringify(trades[i].exchangeToFeesPath))
            //console.log("exchangeToTradePath: " + JSON.stringify(trades[i].exchangeToTradePath))
            //const balanceBefore = await ethers.getDefaultProvider().getBalance(ETH_ADDRESS);
            //console.log("wallet balance before: " + balanceBefore);
            //console.log("block: " + targetBlock);
            //const callData = getCallData(trades, i, arbContract);
            const callData = timeFunctionCall(getCallData, [trades, i, arbContract])
            const feeData = await dependencies.provider.getFeeData()
            //const block = await timeFunctionCall(dependencies.provider.getBlock, [targetBlock - 1])
            
            //const d = new Date();
            //const start = d.getTime()
            //const baseFeeNextBlock = await getBaseFeeNextBlock(targetBlock);
            const baseFeeNextBlock = await timeFunctionCall(getBaseFeeNextBlock, [targetBlock])
            //var d2 = new Date();
            //const end = d2.getTime()
            //console.log("getBaseFee execution time: " +(end - start))
            //const gasEstimate = feeData.gasPrice * 
            //const gasEstimate = arbContract.estimateGas.
            const rawTransaction = {
                to: arbContract.address,
                gasPrice: BigInt(Math.ceil(baseFeeNextBlock)),//BigInt(Math.ceil(Number(BigInt(baseFeeNextBlock._hex)) * 1.127)),//BigInt(Math.floor(Number(baseFee) * 1.125)/* + BigInt(feeData.maxPriorityFeePerGas._hex)*/),
                gasLimit: 1700000,
                nonce: await dependencies.getLatestNonce(),
                data: callData,
                chainId: CHAIN_ID,
                value: 0,
              }
            const signedTransactions = await flashbotsProvider.signBundle([
                {
                  signer: dependencies.wallet,
                  transaction: rawTransaction
                }
            ]);
            //console.log("cost gas approx: " + common.getEthPriceUSD(feeData.gasPrice * 1000000))
            //if(common.getEthPriceUSD(feeData.gasPrice * 1000000 * 2) < trades[i].optimalProfitUSD) {
                timeFunctionCall(console.log, [JSON.stringify(trades[i], replacer, '\t')])
                //console.log(JSON.stringify(trades[i], replacer, '\t'));
                //const d = new Date();
                //const start = d.getTime()
                const simulation = await simulateTransaction(signedTransactions, targetBlock, flashbotsProvider);
                if(simulation.error) continue
                var d2 = new Date();
                //const end = d2.getTime()
                //console.log("duration simulateTransaction: " + (end - start));
                const ethSentToCoinBase = simulation.results[0].ethSentToCoinbase
                const percentToCoinbase = PERCENT_TO_COINBASE / 10000;
                const ethToWallet = (ethSentToCoinBase / percentToCoinbase) * (1 - percentToCoinbase);
                const gasFees = BigInt(Math.ceil(baseFeeNextBlock)) * BigInt(simulation.results[0].gasUsed)//simulation.results[0].gasFees
                console.log("ethToWallet: " + dependencies.ethers.utils.formatEther(BigInt(Math.floor(ethToWallet))));
                console.log("gas fees: " + dependencies.ethers.utils.formatEther(gasFees));
                //x*.96 = ethSentToCoinBase
                //x = (ethSentToCoinBase / .96) * (1 - .96)
            //}
            if(simulation.results[0].error) {
                failedTrades.add(JSON.stringify(trades[i].path));
                break;
            }
    
            if(ethToWallet > Number(gasFees)) {
                console.log("ethtoWallet: " +ethToWallet)
                console.log("gasFees: " + Number(gasFees))
                console.log("sending bundle...")
                /*const bundleSubmission = await flashbotsProvider.sendRawBundle(
                    signedTransactions,
                    targetBlock
                  );*/
                dependencies.sendPrivateTxAlchemy(rawTransaction)
                  console.log("submitted for block # ", targetBlock);
                  //console.log(bundleSubmission)
                  //console.log(JSON.stringify(bundleSubmission))
                  //const receipts = await bundleSubmission.receipts();
                  //const bundelResolution = await bundleSubmission.wait();
                  //const simulationResponse = await bundleSubmission.simulate();
                  //console.log(JSON.stringify(receipts))
                  //console.log(JSON.stringify(bundelResolution))
                  //console.log(JSON.stringify(simulationResponse))
                  //process.exit()
                  break
            } else {
                break;
            }
            //process.exit();
                // Using TypeScript discrimination
            
              //console.log("submitted for block # ", targetBlock);
        }
    }
}
//testSimple();
//testOwnableCall();
main()

async function getBaseFeeNextBlock(targetBlock) {
    const currBlock = await dependencies.provider.getBlock(targetBlock - 1);
    const baseFee = BigInt(currBlock.baseFeePerGas._hex);
    //const gasUsed = block.gasUsed;
    //const gasLimit = block.gasLimit;
    const percentPastTarget = (currBlock.gasUsed - 15000000) / 15000000
    const percentOfMax = .125 * percentPastTarget
    var newBaseFee = 0;
    if(percentOfMax < 0) {
         newBaseFee = (1 - Math.abs(percentOfMax)) * Number(baseFee)
    } else {
        newBaseFee = (1 + Math.abs(percentOfMax)) * Number(baseFee)
    }
    //const baseFeeNextBlock = dependencies.getBaseFeeInNextBlock(block.baseFeePerGas, block.gasUsed, block.gasLimit);
    //getBaseFeeInNextBlock(currentBaseFeePerGas: BigNumber, currentGasUsed: BigNumber, currentGasLimit: BigNumber): BigNumber;
    console.log("cur block base fee: " + baseFee);
    console.log("next block base fee: " + newBaseFee);
    return newBaseFee;
}

function replacer(key, value) {
    if(typeof value == 'bigint') {
        return value.toString() + "n"
    }
    return value;
}

async function simulateTransaction(signedTransactions, targetBlock, flashbotsProvider) {
    //const flashbotsProvider = getFlashbotsProvider();
    const simulation = await flashbotsProvider.simulate(
        signedTransactions,
        targetBlock
    );
    console.log(new Date());

    // Using TypeScript discrimination
    if ("error" in simulation) {
        console.log(`Simulation Error: ${targetBlock} ${simulation.error.message}`);
    } else {
        console.log(
            `Simulation Success: ${targetBlock} ${JSON.stringify(
                simulation,
                null,
                2
            )}`
        );
    }
    return simulation;
}

function getCallData(trades, i, arbContract) {
    //const interface = ethers.utils.Interface(arbContractJSON.abi);
    /*const gasEstimate = await arbContract.estimateGas.callLendingPool(
        [trades[i].path[0]],
        [BigInt(Math.floor(trades[i].optimalInput))],
        trades[i].exchangeToTradePath,
        common.getAllPaths(trades[i].exchangeToTradePath),
        common.getAllExchanges(trades[i].exchangeToTradePath),
        common.getAllFees(trades[i].exchangeToFeesPath),
        common.getAllPools(trades[i].exchangeToPoolsPath),
        PERCENT_TO_COINBASE
    );
    console.log("gasEstimate: " + gasEstimate);*/
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
        /*
            [trades[i].path[0]],
            [BigInt(Math.floor(trades[i].optimalInput))],
            trades[i].exchangeToTradePath,
            common.getAllPaths(trades[i].exchangeToTradePath),
            common.getAllExchanges(trades[i].exchangeToTradePath),
            common.getAllFees(trades[i].exchangeToFeesPath),
            common.getAllPools(trades[i].exchangeToPoolsPath),
            9000
        */
    return functionData;
}

function getCallDataContractBalance() {
    const ABI = [
        "function getContractBalance() returns (uint256)"
    ];
    const iFace = dependencies.ethers.utils.Interface(ABI);
    const functionData = iFace.encodeFunctionData('getContractBalance');
    return functionData;
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