const common = require("./common.js");
const startCoins = require("../files/start_coins.json");
var tradesCycles = Array();
const maxHops = 4;
const minHops = 1;
const WETH = "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2";
const DAI = "0x6b175474e89094c44da98b954eedeac495271d0f";

// const testCase = new Map();
// testCase.set("A", [{"address": 1, "token0": {"address": "B"}, "token1": {"address": "A"}}]);
// testCase.set("B", [{"address": 2, "token0": {"address": "C"}, "token1": {"address": "B"}}]);
// testCase.set("C", [{"address": 3, "token0": {"address": "C"}, "token1": {"address": "A"}}]);
//tokenMap = testCase;
function findArbCycles(list, visited, tokenAddr, res, hop, root, visitedPairs, tokenMap) {
    if(tokenAddr == root && hop > minHops) {
        //common.updateReserves(list);
        //common.orderPairs(list);
       //res.push(JSON.parse(JSON.stringify(list)));
        var listCopy = [];
        list.forEach((pair,i) => {
          listCopy[i] = pair;
        })
        listCopy.startToken = root;
        res.push(listCopy);
        return;
    }
    if(hop == maxHops) return;
    if(!tokenMap.has(tokenAddr)) return;
    var pairs = tokenMap.get(tokenAddr);
    for(var i = 0; i < pairs.length; i++) {
        var nextToken = pairs[i].token0.address == tokenAddr ? pairs[i].token1.address : pairs[i].token0.address;
        if(visitedPairs.has(pairs[i].address)) {
            continue;
        }
        //visited.add(nextToken);
        list.push(pairs[i]);
        var visitedPair = pairs[i].address;
        visitedPairs.add(visitedPair)
        findArbCycles(list, visited, nextToken, res, hop + 1, root, visitedPairs, tokenMap);
        list.pop();
        visitedPairs.delete(visitedPair);
        //visited.delete(nextToken)
    }
}

function findArbCyclesInterchangableStableCoins(list, visited, tokenAddr, res, hop, root, visitedPairs, tokenMap, stableCoins) {
    if(stableCoins.has(tokenAddr) && hop > minHops) {
        //common.updateReserves(list);
        //common.orderPairs(list);
       //res.push(JSON.parse(JSON.stringify(list)));
        var listCopy = [];
        list.forEach((pair,i) => {
          listCopy[i] = pair;
        })
        listCopy.startToken = root;
        listCopy.endToken = tokenAddr;
        res.push(listCopy);
        return;
    }
    if(hop == maxHops) return;
    if(!tokenMap.has(tokenAddr)) return;
    var pairs = tokenMap.get(tokenAddr);
    for(var i = 0; i < pairs.length; i++) {
        var nextToken = pairs[i].token0.address == tokenAddr ? pairs[i].token1.address : pairs[i].token0.address;
        if(visitedPairs.has(pairs[i].address)) {
            continue;
        }
        //visited.add(nextToken);
        list.push(pairs[i]);
        var visitedPair = pairs[i].address;
        visitedPairs.add(visitedPair)
        findArbCyclesInterchangableStableCoins(list, visited, nextToken, res, hop + 1, root, visitedPairs, tokenMap, stableCoins);
        list.pop();
        visitedPairs.delete(visitedPair);
        //visited.delete(nextToken)
    }
}

function findArbs(tokenMap) {

    startCoins.forEach((coin) => {
      var visited = new Set();
      var list = Array();
      var visitedPairs = new Set();
      //visited.add(k);
      findArbCycles(list, visited, coin.address.toLowerCase(), tradesCycles, 0, coin.address.toLowerCase(), visitedPairs, tokenMap);
      visited.clear();
      list.pop();
  })
    /*const stableCoins = new Set();
    startCoins.forEach((coin) => {
        if(coin.address != WETH) {
            stableCoins.add(coin.address);
        }
    })
    startCoins.forEach((coin) => {
        if(coin.address != WETH) { //stable coins only
            var visited = new Set();
            var list = Array();
            var visitedPairs = new Set();
            //visited.add(k);
            findArbCyclesInterchangableStableCoins(list, visited, coin.address.toLowerCase(), tradesCycles, 0, coin.address.toLowerCase(), visitedPairs, tokenMap, stableCoins);
            visited.clear();
            list.pop();
        }
    })*/
    return tradesCycles;
}

/*tradesCycles.forEach((val) => {
    console.log(val);
})*/
//console.log(tradesCycles[0]);

//module.exports.tradesCycles = tradesCycles;
module.exports.findArbs = findArbs;