const hre = require("hardhat");
var fs = require('fs');
const top_uniswap_addrs = require("../files/top_uniswap_pool_addrs.json");
const top_uniswap_pairs = require("../files/top_uniswap.json");
const hot_pairs_uniswap = require("../files/hot_liquidity_pools_uniswap.json");
const hot_pairs_sushiswap = require ("../files/hot_liquidity_pools_sushiswap.json");
const util = require('util')
//const { setTimeout, setInterval } = require("timers/promises");
const writeFile = util.promisify(fs.writeFile);
const readFile = util.promisify(fs.readFile);


async function getUniswapPairData2(poolAddrs) {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    await readFile('./files/top_uniswap.json', 'utf8', async function readFileCallback(err, data) {
        var obj = JSON.parse(data);
        for(var i = 0; i < poolAddrs.length ; i++) {
            //var uniswap_20 = [];
            
            //uniswap_20.push(top_uniswap_addrs[i])
            try {
                var results = await pairsContract.getPairDataUniswap([poolAddrs[i]]);
            } catch(err) {
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, exchange: "uni", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex))}
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        var json = JSON.stringify(obj);
        writeFile('./files/top_uniswap.json', json, 'utf8', ()=>{}); // write it back 
    });
    

        
        //await writeFile('./files/top_uniswap.json', json, 'utf8', ()=>{}); // write it back 
}
/*async function getAllUniswapPairs() {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    var allPairsLength = await pairsContract.allPairsLength();
    //allPairsLength = 100;
    await readFile('./files/all_uniswap_pairs.json', 'utf8', async function readFileCallback(err, data) {
        var obj = JSON.parse(data);
        for(var i = 0; i < BigInt(allPairsLength._hex) ; i++) {
            //var uniswap_20 = [];
            
            //uniswap_20.push(top_uniswap_addrs[i])
            try {
                var results = await pairsContract.getAllPairDataUniswap(i);
            } catch(err) {
                console.log(err);
                continue;
            }
            //for(var j = 0; j < results.length; j++) {
            var pair = {index: i, address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex))}
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        var json = JSON.stringify(obj);
        writeFile('./files/all_uniswap_pairs.json', json, 'utf8', ()=>{}); // write it back 
    });
    

        
        //await writeFile('./files/top_uniswap.json', json, 'utf8', ()=>{}); // write it back 
}

async function getUniswapPairData() {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    var allPairsLength = await pairsContract.allPairsLength();
    //allPairsLength = 100;
    await readFile('./files/all_uniswap_pairs2.json', 'utf8', async function readFileCallback(err, data) {
        var obj = JSON.parse(data);
        var results = await pairsContract.getAllPairDataUniswap2()
        //console.log(results);
        for(var i = 0; i < results.length; i++) {
            var pair = {index: i, address: results[i]._poolAddress.toLowerCase(), token0: {address: results[i]._token0.toLowerCase(), symbol: results[i]._token0_symbol, decimal: results[i]._token0_decimal}, token1: {address: results[i]._token1.toLowerCase(), symbol: results[i]._token1_symbol, decimal: results[i]._token1_decimal}, reserve0: Number(BigInt(results[i]._reserve0._hex)), reserve1: Number(BigInt(results[i]._reserve1._hex))}
            console.log(pair);
            obj.push(pair);
        }
        var json = JSON.stringify(obj);
        writeFile('./files/all_uniswap_pairs2.json', json, 'utf8', ()=>{}); // write it back 
    });

}*/

async function getSushiSwapPairData(poolAddrs) {
    const PairsContract = await hre.ethers.getContractFactory("Pairs");
    const pairsContract = await PairsContract.deploy();
    await readFile('./files/top_sushi_pairs.json', 'utf8', async function readFileCallback(err, data) {
        var obj = JSON.parse(data);
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
            var pair = {index: i, exchange: "sushi", address: results[0]._poolAddress.toLowerCase(), token0: {address: results[0]._token0.toLowerCase(), symbol: results[0]._token0_symbol, decimal: results[0]._token0_decimal}, token1: {address: results[0]._token1.toLowerCase(), symbol: results[0]._token1_symbol, decimal: results[0]._token1_decimal}, reserve0: Number(BigInt(results[0]._reserve0._hex)), reserve1: Number(BigInt(results[0]._reserve1._hex))}
            obj.push(pair);
            //}
            //await new Promise(resolve => setTimeout(resolve, 1000));
        }
        var json = JSON.stringify(obj);
        writeFile('./files/top_sushi_pairs.json', json, 'utf8', ()=>{}); // write it back 
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

getUniswapPairData2(hot_pairs_uniswap).
    then(() => process.exit(0))
    .catch(error => {
      console.error(error);
      process.exit(1);
    });