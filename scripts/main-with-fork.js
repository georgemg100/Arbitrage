const hre = require("hardhat");
const common = require("./common.js");
const dfs = require("./dfs.js");
//const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");
const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");
const uni = require("@uniswap/v2-sdk");
const { MultiCall } = require('@indexed-finance/multicall');
const { ethers } = require("hardhat");

const UNISWAPV3ROUTER2 = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const UNISWAPV3ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";

const ETH_ACCOUNT = "0xf39fd6e51aad88f6f4ce6ab8827279cfffb92266";
async function main() {
    // Hardhat always runs the compile task when running scripts with its command
    // line interface.
    //
    // If this script is run directly using `node` you may want to call compile 
    // manually to make sure everything is compiled
    // await hre.run('compile');
    const multi = new MultiCall(ethers.provider)
    const ArbContract = await hre.ethers.getContractFactory("ArbContract");
    //constructor(ILendingPoolAddressesProvider provider, uint256 tokenId, uint256 nftVault, uint256 nftContract, uint256 nftType) public FlashLoanReceiverBase(provider) {
    const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
    await arbContract.deployed();
    console.log("estimate gas: ")
    //console.log("gas limit deploy: " + arbContract.deployTransaction.gasLimit)
    //const gas = await ethers.getDefaultProvider().estimateGas(arbContract.deployTransaction)
    // We get the contract to deploy
    const tokenMap = common.createTokenMap(pairs);
    const tradesCycles = dfs.findArbs(tokenMap, arbContract);
    const d = new Date();
    const start = d.getTime();
    //var reqs = []
    var latestBlockNum = await ethers.provider.getBlockNumber();
    console.log("latestBlockNum: " + latestBlockNum);
    //await ethers.provider.getBlock(latestBlockNum + 1);
    await common.updateReserves4Async(tradesCycles, arbContract);
    /*for(var i = 0; i < tradesCycles.length; i++) {
      reqs.push(common.updateReserves2(tradesCycles[i], arbContract))
      //await common.updateReserves2(tradesCycles[i], arbContract);
      //common.orderPairs(tradesCycles[i]);
    }*/
    
    //await Promise.all(reqs);
    const trades = common.getProfitableTrades(tradesCycles);
    //console.log("aprime: " + common.getAprime(trades[0].tradeCycle, trades[0].optimalInput));
    common.sortTrades(trades);
    //console.log(trades[0]);
    //console.log(Math.floor(trades[0].optimalInput));
    var succeeded = 0;
    var failed = 0;
    var total = 0;
    var failedTrades = [];
    var d2 = new Date();
    const end = d2.getTime()
    const duration = end - start;
    console.log("duration: " + duration);
    for(var i = 0; i < /*trades.length*/1; i++) {
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
      trades[i] = getTestTrade(optimalProfit, EaEb);
      
      //trades[i].tradeCycle = undefined;
      if(EaEb[0] < EaEb[1] && optimalProfit > 0) {
        console.log(JSON.stringify(trades[i], replacer, '\t'));
        //console.log("exchangeToFeesPath: " + JSON.stringify(trades[i].exchangeToFeesPath))
        console.log("exchangeToTradePath: " + JSON.stringify(trades[i].exchangeToTradePath))
        const balanceBefore = await ethers.getDefaultProvider().getBalance(ETH_ACCOUNT);
        console.log("wallet balance before: " + balanceBefore);
        try {
          //await arbContract.methods.callLendingPool().estimateGas()
          /*const gas = await arbContract.estimateGas.callLendingPool(
            [trades[i].path[0]],
            [BigInt(Math.floor(trades[i].optimalInput))],
            //trades[i].path,
            //trades[i].exchangePath
            //[{exchange: "uni", _path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]}]
            trades[i].exchangeToTradePath,
            //[["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]],
            //["uni", "sushi"]
            common.getAllPaths(trades[i].exchangeToTradePath),
            common.getAllExchanges(trades[i].exchangeToTradePath),
            common.getAllFees(trades[i].exchangeToFeesPath),
            common.getAllPools(trades[i].exchangeToPoolsPath),
            9600
          );
          console.log("gas estimate: " + gas)*/
          const tx = await arbContract.callLendingPool(
            [trades[i].path[0]],
            [BigInt(Math.floor(trades[i].optimalInput))],
            //trades[i].path,
            //trades[i].exchangePath
            //[{exchange: "uni", _path: ["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]}]
            trades[i].exchangeToTradePath,
            //[["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2", "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]],
            //["uni", "sushi"]
            common.getAllPaths(trades[i].exchangeToTradePath),
            common.getAllExchanges(trades[i].exchangeToTradePath),
            common.getAllFees(trades[i].exchangeToFeesPath),
            common.getAllPools(trades[i].exchangeToPoolsPath),
            9600
          );
          //const gainLoss = await arbContract.getGainLoss();
          const balanceAfter = await ethers.getDefaultProvider().getBalance(ETH_ACCOUNT);
          //console.log(JSON.stringify(tx));
          /*if(Number(gainLoss._hex) <= 0) {
            failed++;
          } else {
            //console.log(trades[i]);
            succeeded++;
          }*/
        } catch(error) {
          failedTrades.push(trades[i]);
          failed++;
          console.log(error);
          //substring <UnrecognizedContract>.<unknown> (  --- to --- )\n
          //error.stack.substring
        }
      }
    }
    console.log("trades length: " + trades.length);
    console.log("total trades: " + total);
    console.log("succeeded: " + succeeded + ", failed: " + failed);
    console.log("success rate: " + succeeded / (succeeded + failed)); 
    
    //callLendingPool(Math.floor(trades[0].optimalInput), 0, trades[0].path, arbContract.address);

//    const tx = await arbContract.swapExactTokensForTokensUniswap(Math.floor(trades[0].optimalInput), 0, trades[0].path, arbContract.address)
    //console.log(tx);
  }

  function replacer(key, value) {
    if(typeof value == 'bigint') {
        return value.toString() + "n"
    }
    return value;
}

  // async function doTrade(trades) {
  //   const ArbContract = await hre.ethers.getContractFactory("ArbContract");
  //   //constructor(ILendingPoolAddressesProvider provider, uint256 tokenId, uint256 nftVault, uint256 nftContract, uint256 nftType) public FlashLoanReceiverBase(provider) {
  //   const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
  //   await arbContract.deployed();
  //   //await arbContract.setData(TOKEN_ID_WOW, WOW_NFT20_VAULT, WOW_NFTX_VAULT, WOW_NFT, 721, false);
  //   // /swapExactTokensForTokensUniswap(uint256 amountIn, uint256 amountOutMin, address[] memory path, address to)
  //   const tx = arbContract.swapExactTokensForTokensUniswap(Math.floor(trades[0].optimalInput), 0, trades[0].path, arbContract.address)
  //   console.log(tx);
  //   /*await arbContract.callLendingPool(
  //     [WETH],
  //     [ethers.utils.parseEther('7')],
  //     [0],
  //     '0x10',
  //     '0'
  //   );*/
  // }
  
  // We recommend this pattern to be able to use async/await everywhere
  // and properly handle errors.
  main()
    .then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });

function getTestTrade() {
      //var testTrade = {"optimalInput":2368582416197232000,"decimalInput":18,"optimalProfit":48202495974223685n,"optimalProfitUSD":58.3124184226987,"tradeCycle":[{"index":82,"exchange":"uni_v3","address":"0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640","token0":{"address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","symbol":"USDC","decimal":6},"token1":{"address":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","symbol":"WETH","decimal":18},"reserve0":354739588807797n,"reserve1":291593642027129227707767n,"fee":500,"feeNumerator":999500,"feeDenominator":1000000},{"index":1,"exchange":"uni_v3","address":"0x9d96880952b4c80a55099b9c258250f2cc5813ec","token0":{"address":"0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","symbol":"USDC","decimal":6},"token1":{"address":"0xa693b19d2931d498c5b318df961919bb4aee87a5","symbol":"UST","decimal":6},"reserve0":302810388506n,"reserve1":20189073949737n,"fee":10000,"feeNumerator":990000,"feeDenominator":1000000},{"index":0,"exchange":"sushi","address":"0x9a0cc6791a5409ce3547f1f1d00e058c79d0a72c","token0":{"address":"0xa693b19d2931d498c5b318df961919bb4aee87a5","symbol":"UST","decimal":6},"token1":{"address":"0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","symbol":"WETH","decimal":18},"reserve0":17345715651015n,"reserve1":225684033726009056760n,"fee":3000,"feeNumerator":997000,"feeDenominator":1000000}],"path":["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0xa693b19d2931d498c5b318df961919bb4aee87a5","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"],"exchangePath":["uni_v3","uni_v3","sushi"],"exchangeToTradePath":[{"exchange":"uni_v3","_path":["0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2","0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48","0xa693b19d2931d498c5b318df961919bb4aee87a5"]},{"exchange":"sushi","_path":["0xa693b19d2931d498c5b318df961919bb4aee87a5","0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"]}],"exchangeToFeesPath":[{"exchange":"uni_v3","fees":[500n,10000n]},{"exchange":"sushi","fees":[3000n]}],"exchangeToPoolsPath":[{"exchange":"uni_v3","poolAddresses":["0x88e6a0c2ddd26feeb64f039a2c41296fcb3f5640","0x9d96880952b4c80a55099b9c258250f2cc5813ec"]},{"exchange":"sushi","poolAddresses":["0x9a0cc6791a5409ce3547f1f1d00e058c79d0a72c"]}],"ea":116329608640701248409n,"eb":121173169871018335115n,"EaEb":[116329608640701248409n,121173169871018335115n,"0xa693b19d2931d498c5b318df961919bb4aee87a5"]}
      var testTrade = {
        "optimalInput": 267897623916261900000,
        "decimalInput": 18,
        "optimalProfit": 1094793100030994681n,
        "optimalProfitUSD": 70.16090921298856,
        "tradeCycle": [
          {
            "index": 46,
            "exchange": "uni_v3",
            "address": "0x1353fe67fff8f376762b7034dc9066f0be15a723",
            "token0": {
              "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
              "symbol": "AAVE",
              "decimal": 18
            },
            "token1": {
              "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH",
              "decimal": 18
            },
            "reserve0": 58180704489755027936818n,
            "reserve1": 3201832069088069161554n,
            "fee": 10000,
            "feeNumerator": 990000,
            "feeDenominator": 1000000
          },
          {
            "index": 53,
            "exchange": "uni",
            "address": "0xd3d2e2692501a5c9ca623199d38826e513033a17",
            "token0": {
              "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
              "symbol": "UNI",
              "decimal": 18
            },
            "token1": {
              "address": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "symbol": "WETH",
              "decimal": 18
            },
            "reserve0": 1563519623473874833112737n,
            "reserve1": 6952809178882602515824n,
            "fee": 3000,
            "feeNumerator": 997000,
            "feeDenominator": 1000000
          },
          {
            "index": 47,
            "exchange": "uni_v3",
            "address": "0x59c38b6775ded821f010dbd30ecabdcf84e04756",
            "token0": {
              "address": "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
              "symbol": "UNI",
              "decimal": 18
            },
            "token1": {
              "address": "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
              "symbol": "AAVE",
              "decimal": 18
            },
            "reserve0": 478948453036666305820326n,
            "reserve1": 40020259403147174188800n,
            "fee": 3000,
            "feeNumerator": 997000,
            "feeDenominator": 1000000
          }
        ],
        "path": [
          "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
          "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
          "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
          "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
        ],
        "exchangePath": [
          "uni_v3",
          "uni",
          "uni_v3"
        ],
        "exchangeToTradePath": [
          {
            "exchange": "uni_v3",
            "_path": [
              "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9",
              "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2"
            ]
          },
          {
            "exchange": "uni",
            "_path": [
              "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
              "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
            ]
          },
          {
            "exchange": "uni_v3",
            "_path": [
              "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984",
              "0x7fc66500c84a76ad7e9c93437bfc5ac33e2ddae9"
            ]
          }
        ],
        "exchangeToFeesPath": [
          {
            "exchange": "uni_v3",
            "fees": [
              10000n
            ]
          },
          {
            "exchange": "uni",
            "fees": [
              3000n
            ]
          },
          {
            "exchange": "uni_v3",
            "fees": [
              3000n
            ]
          }
        ],
        "exchangeToPoolsPath": [
          {
            "exchange": "uni_v3",
            "poolAddresses": [
              "0x1353fe67fff8f376762b7034dc9066f0be15a723"
            ]
          },
          {
            "exchange": "uni",
            "poolAddresses": [
              "0xd3d2e2692501a5c9ca623199d38826e513033a17"
            ]
          },
          {
            "exchange": "uni_v3",
            "poolAddresses": [
              "0x59c38b6775ded821f010dbd30ecabdcf84e04756"
            ]
          }
        ],
        "ea": 19699261916434250464978n,
        "eb": 20248553140778347428369n,
        "EaEb": [
          19699261916434250464978n,
          20248553140778347428369n,
          "0x1f9840a85d5af5bf1d1762f925bdaddc4201f984"
        ]
      }
      
      return testTrade
}
