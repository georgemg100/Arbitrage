const hre = require("hardhat");
var fs = require('fs');
//const top_uniswap_addrs = require("../files/top_uniswap_pool_addrs.json");
//const top_uniswap_pairs = require("../files/top_uniswap.json");
const hot_pairs_uniswap = require("../files/hot_liquidity_pools_uniswap.json");
const hot_pairs_sushiswap = require ("../files/hot_liquidity_pools_sushiswap.json");
const hot_pairs_uniswap_v3 = require("../files/hot_liquidity_pools_uniswap_v3.json");
const periphery_uniswap = require("../files/periphery_uniswap.json");
const periphery_sushiswap = require("../files/periphery_sushiswap.json");
const periphery_uniswap_v3 = require("../files/periphery_uniswap_v3.json");
const banned_tokens = require("../files/banned_tokens.json");
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

async function getPairs(uniswapV3Pools, sushiswapPools, uniswapV2Pools) {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    var setUniswapV3Pools = new Set();
    var setUniswapV2Pools = new Set();
    var setSushiSwapPools = new Set();
    var setBanned = new Set();
    banned_tokens.forEach((token) => {
        setBanned.add(token);
    })
    for(var i = 0; i < uniswapV3Pools.length; i++) {
        setUniswapV3Pools.add(uniswapV3Pools[i]);
    }
    for(var i = 0; i < sushiswapPools.length; i++) {
        setSushiSwapPools.add(sushiswapPools[i]);
    }
    for(var i = 0; i < uniswapV2Pools.length; i++) {
        setUniswapV2Pools.add(uniswapV2Pools[i]);
    }
    uniswapV3Pools = Array.from(setUniswapV3Pools);
    uniswapV2Pools = Array.from(setUniswapV2Pools);
    sushiswapPools = Array.from(setSushiSwapPools);
    //await writeFile('./files/top_uniswap_v3.json', "[]", 'utf8', ()=>{});
    await readFile('./files/top_uni_sushi_uni_v3_pairs.json', 'utf8', async function readFileCallback(err, data) {
        var obj = []//JSON.parse(data);
        for(var i = 0; i < uniswapV3Pools.length ; i++) {
            try {
                var results = await pairsContract.getPairDataUniswapV3([uniswapV3Pools[i]]);
            } catch(err) {
                console.log("pool address that failed: " + uniswapV3Pools[i]);
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "uni_v3", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex)), fee: Number(BigInt(results[0]._fee))}
            if(setBanned.has(pair.token0.address) || setBanned.has(pair.token1.address)) continue
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        for(var i = 0; i < uniswapV2Pools.length; i++) {
            try {
                var results = await pairsContract.getPairDataUniswap([uniswapV2Pools[i]]);
            } catch(err) {
                console.log("pool address that failed: " + uniswapV2Pools[i]);
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "uni", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex)), fee: Number(BigInt(results[0]._fee))}
            if(setBanned.has(pair.token0.address) || setBanned.has(pair.token1.address)) continue
            obj.push(pair);
        }
        for(var i = 0; i < sushiswapPools.length; i++) {
            try {
                var results = await pairsContract.getPairDataSushiswap([sushiswapPools[i]]);
            } catch(err) {
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "sushi", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex)), fee: Number(BigInt(results[0]._fee))}
            if(setBanned.has(pair.token0.address) || setBanned.has(pair.token1.address)) continue
            obj.push(pair);
        }
        var json = JSON.stringify(obj);
        writeFile('./files/top_uni_sushi_uni_v3_pairs.json', json, 'utf8', ()=>{}); // write it back 
    });
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

getPairs(periphery_uniswap_v3, periphery_sushiswap, periphery_uniswap).
    then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });