const hre = require("hardhat");
var fs = require('fs');
//const top_uniswap_addrs = require("../files/top_uniswap_pool_addrs.json");
//const top_uniswap_pairs = require("../files/top_uniswap.json");
const hot_pairs_uniswap = require("../files/hot_liquidity_pools_uniswap.json");
const hot_pairs_sushiswap = require ("../files/hot_liquidity_pools_sushiswap.json");
const hot_pairs_uniswap_v3 = require("../files/hot_liquidity_pools_uniswap_v3.json");
const util = require('util')
//const { setTimeout, setInterval } = require("timers/promises");
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);


async function getUniswapPairData2(poolAddrs) {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    //await writeFile('./files/top_uniswap.json', "[]", 'utf8', ()=>{});
    await readFile('./files/top_uniswap.json', 'utf8', async function readFileCallback(err, data) {
        var obj = [];//JSON.parse(data);
        for(var i = 0; i < poolAddrs.length ; i++) {
            //var uniswap_20 = [];
            
            //uniswap_20.push(top_uniswap_addrs[i])
            try {
                var results = await pairsContract.getPairDataUniswap([poolAddrs[i]]);
            } catch(err) {
                console.log("pool address that failed: " + poolAddrs[i]);
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "uni", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex)), fee: Number(BigInt(results[0]._fee))}
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        var json = JSON.stringify(obj);
        writeFile('./files/top_uniswap.json', json, 'utf8', ()=>{}); // write it back 
    });
    

        
        //await writeFile('./files/top_uniswap.json', json, 'utf8', ()=>{}); // write it back 
}

async function getSushiSwapPairData(poolAddrs) {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    //await writeFile('./files/top_sushi_pairs.json', "[]", 'utf8', ()=>{});
    await readFile('./files/top_sushiswap.json', 'utf8', async function readFileCallback(err, data) {
        var obj = []//JSON.parse(data);
        for(var i = 0; i < poolAddrs.length ; i++) {
            //var uniswap_20 = [];
            
            //uniswap_20.push(top_uniswap_addrs[i])
            try {
                var results = await pairsContract.getPairDataSushiswap([poolAddrs[i]]);
            } catch(err) {
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "sushi", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex)), fee: Number(BigInt(results[0]._fee))}
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        var json = JSON.stringify(obj);
        writeFile('./files/top_sushiswap.json', json, 'utf8', ()=>{}); // write it back 
    });
}

async function getUniswapV3PairData(poolAddrs) {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    //await writeFile('./files/top_uniswap_v3.json', "[]", 'utf8', ()=>{});
    await readFile('./files/top_uniswap_v3.json', 'utf8', async function readFileCallback(err, data) {
        var obj = []//JSON.parse(data);
        for(var i = 0; i < poolAddrs.length ; i++) {
            //var uniswap_20 = [];
            
            //uniswap_20.push(top_uniswap_addrs[i])
            try {
                var results = await pairsContract.getPairDataUniswapV3([poolAddrs[i]]);
            } catch(err) {
                console.log("pool address that failed: " + poolAddrs[i]);
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "uni_v3", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex)), fee: Number(BigInt(results[0]._fee))}
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        var json = JSON.stringify(obj);
        writeFile('./files/top_uniswap_v3.json', json, 'utf8', ()=>{}); // write it back 
    });
    

        
        //await writeFile('./files/top_uniswap.json', json, 'utf8', ()=>{}); // write it back 
}

async function writeFileTest() {
    var obj = {testing: "testing"};
    var json = JSON.stringify(obj); 

    await writeFile('./files/top_uniswap.json', json, (err)=>{
         (err) => {
        if (err)
          console.log(err);
        else {
          console.log("File written successfully\n");
        }
    }
});
}

getUniswapV3PairData(hot_pairs_uniswap_v3).
    then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });