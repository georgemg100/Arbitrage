const hre = require("hardhat");
const common = require("./common.js");
const dfs = require("./dfs.js");
const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");
const { ethers } = require("hardhat");
const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const { ethers } = require("hardhat");
const {FlashbotsBundleProvider,} = require("@flashbots/ethers-provider-bundle");
const provider = ethers.getDefaultProvider();
// `authSigner` is an Ethereum private key that does NOT store funds and is NOT your bot's primary key.
  // This is an identifying key for signing payloads to establish reputation and whitelisting
const authSigner = new ethers.Wallet(
    "0x0000000000000000000000000000000000000000000000000000000000000000"
  );

const flashbotsProvider = await FlashbotsBundleProvider.create(
    provider,
    authSigner
);
/*const signedBundle = await flashbotsProvider.signBundle([
    {
      signer: SOME_SIGNER_TO_SEND_FROM,
      transaction: SOME_TRANSACTION_TO_SEND,
    },
  ]);*/
const response = await flashbotsProvider.getUserStats();
console.log(resonse);
  
async function main() {

    const ArbContract = await hre.ethers.getContractFactory("ArbContract");
    const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
    await arbContract.deployed();

    const tokenMap = common.createTokenMap(pairs);
    const tradesCycles = dfs.findArbs(tokenMap, arbContract);
    const d = new Date();
    const start = d.getTime();

    var latestBlockNum = await ethers.provider.getBlockNumber();
    console.log("latestBlockNum: " + latestBlockNum);
    //await ethers.provider.getBlock(latestBlockNum + 1);
    await common.updateReserves4(tradesCycles, arbContract);
    const trades = common.getProfitableTrades(tradesCycles);
    common.sortTrades(trades);
    var succeeded = 0;
    var failed = 0;
    var total = 0;
    var failedTrades = [];
    var d2 = new Date();
    const end = d2.getTime()
    const duration = end - start;
    console.log("duration: " + duration);
    for(var i = 0; i < /*trades.length*/5; i++) {
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
      if(EaEb[0] < EaEb[1] && optimalProfit > 0) {
        console.log(trades[i]);
        console.log("exchangeToTradePath: " + JSON.stringify(trades[i].exchangeToTradePath))
        try {
          /*const gas = await arbContract.estimateGas.callLendingPool(
            [trades[i].path[0]],
            [BigInt(Math.floor(trades[i].optimalInput))],
            [0],
            '0x10',
            '0',
            //trades[i].path,
            //trades[i].exchangePath
            //[{exchange: "uni", _path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]}]
            trades[i].exchangeToTradePath,
            //[["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]],
            //["uni", "sushi"]
            common.getAllPaths(trades[i].exchangeToTradePath),
            common.getAllExchanges(trades[i].exchangeToTradePath),
            common.getAllFees(trades[i].exchangeToFeesPath),
            common.getAllPools(trades[i].exchangeToPoolsPath)
          );*/
          const tx = await arbContract.callLendingPool(
            [trades[i].path[0]],
            [BigInt(Math.floor(trades[i].optimalInput))],
            [0],
            '0x10',
            '0',
            trades[i].exchangeToTradePath,
            common.getAllPaths(trades[i].exchangeToTradePath),
            common.getAllExchanges(trades[i].exchangeToTradePath),
            common.getAllFees(trades[i].exchangeToFeesPath),
            common.getAllPools(trades[i].exchangeToPoolsPath)
          );
          const gainLoss = await arbContract.getGainLoss();
          if(Number(gainLoss._hex) <= 0) {
            failed++;
          } else {
            succeeded++;
          }
        } catch(error) {
          failedTrades.push(trades[i]);
          failed++;
          console.log(error);
        }
      }
    }
  }
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });