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
    const arbContract = await ArbContract.deploy(AVVE_PROVIDER, ETH_ACCOUNT);
    await arbContract.deployed();
    console.log("estimate gas: ")
    console.log("gas limit deploy: " + arbContract.deployTransaction.gasLimit)
    const gas = await ethers.getDefaultProvider().estimateGas(arbContract.deployTransaction)
    // We get the contract to deploy
    const tokenMap = common.createTokenMap(pairs);
    const tradesCycles = dfs.findArbs(tokenMap, arbContract);
    const d = new Date();
    const start = d.getTime();
    //var reqs = []
    var latestBlockNum = await ethers.provider.getBlockNumber();
    console.log("latestBlockNum: " + latestBlockNum);
    //await ethers.provider.getBlock(latestBlockNum + 1);
    await common.updateReserves4(tradesCycles, arbContract);
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
      //trades[i].tradeCycle = undefined;
      if(EaEb[0] < EaEb[1] && optimalProfit > 0) {
        console.log(trades[i]);
        //console.log("exchangeToFeesPath: " + JSON.stringify(trades[i].exchangeToFeesPath))
        console.log("exchangeToTradePath: " + JSON.stringify(trades[i].exchangeToTradePath))
        const balanceBefore = await ethers.getDefaultProvider().getBalance(ETH_ACCOUNT);
        console.log("wallet balance before: " + balanceBefore);
        try {
          //await arbContract.methods.callLendingPool().estimateGas()
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
            9000
          );
          const gainLoss = await arbContract.getGainLoss();
          const balanceAfter = await ethers.getDefaultProvider().getBalance(ETH_ACCOUNT);
          //console.log(JSON.stringify(tx));
          if(Number(gainLoss._hex) <= 0) {
            failed++;
          } else {
            //console.log(trades[i]);
            succeeded++;
          }
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