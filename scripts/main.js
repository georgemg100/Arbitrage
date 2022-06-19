const hre = require("hardhat");
const common = require("./common.js");
const dfs = require("./dfs.js");
const pairs = require("../files/top_uni_sushi_uni_v3_balancer_pairs.json");
const uni = require("@uniswap/v2-sdk");
const { MultiCall } = require('@indexed-finance/multicall');
const { ethers } = require("hardhat");
const { Contract } = require("ethers");
const provider = ethers.getDefaultProvider();
const UNISWAPV3ROUTER2 = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";
const UNISWAPV3ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";
const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const profitableTrades = [];
const uniswapV2PairJSON = require("../artifacts/contracts/IUniswapV2Pair.sol/IUniswapV2Pair.json")
const uniswapV3PoolJSON = require("@uniswap/v3-core/artifacts/contracts/UniswapV3Pool.sol/UniswapV3Pool.json");

//console.log(provider.network)
async function main() {
    const tokenMap = common.createTokenMap(pairs);
    const tradesCycles = dfs.findArbs(tokenMap);
    var set = new Set();
    while(true) {
        await common.updateReservesDirectFromUniswap2(tradesCycles, provider, uniswapV2PairJSON.abi, uniswapV3PoolJSON.abi);
        const trades = common.getProfitableTrades(tradesCycles);
        //profitableTrades.push(...trades);
        common.sortTrades(trades)
        for(var i = 0; i < 10; i++) {
          profitableTrades.push(trades[i]);
        }
        //if(trades)
        await timeout(1000);
    }
}

main()
.then(() => process.exit(0))
.catch(error => {
  console.error(error);
  process.exit(1);
});

process.on('SIGINT', function() {
    console.log("Caught interrupt signal");
    common.sortTrades(profitableTrades);
    //var prev;
    for(var i = 0; i < /*profitableTrades.length*/ 100; i++) {
        //if(i >= profitableTrades.length) break;
        //if(prev && profitableTrades[i].optimalProfitUSD == prev.optimalProfitUSD) continue;
        //prev = profitableTrades[i];
        console.log(profitableTrades[i]);
    }
    process.exit();
});

async function timeout(time) {
    await new Promise((res, rej) => {
        setTimeout(() => {
          res('foo');
          console.log("foo")
        }, time)
      });
}