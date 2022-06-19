//const pairs = require("../files/100_pairs.json");
//const {tradeCycles} = require("./dfs.js");
const { ethers } = require("hardhat");
const feePercent = 0.003;
const start_coins = require("../files/start_coins.json");
const prices = require("./prices");
const WETH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
const r = 1 - feePercent;
let https = require('https');
const urlExchRate = 'https://api.coinmarketcap.com/v2/ticker/1027/?convert=USD';
const bigDecimal = require('js-big-decimal');
const feeNumeratorsMap = new Map();
const feeDenominatorsMap = new Map();

feeNumeratorsMap.set(100, BigInt(9999));
feeNumeratorsMap.set(3000, BigInt(997));
feeNumeratorsMap.set(500, BigInt(9995));
feeNumeratorsMap.set(10000, BigInt(99));
feeNumeratorsMap.set(20000000000000000, BigInt(20000000000000000));
feeDenominatorsMap.set(3000, BigInt(1000));
feeDenominatorsMap.set(500, BigInt(10000));
feeDenominatorsMap.set(10000, BigInt(100));
feeDenominatorsMap.set(100, BigInt(10000));
feeDenominatorsMap.set(20000000000000000, BigInt(1000000000000000000));

const createTokenMap = (pairs) => {
    const tokenMap = new Map();
    for(var i = 0; i < pairs.length; i++) {
        //console.log(pairs[i] + "\n");
        if(!tokenMap.has(pairs[i].token0.address)) {
            const pairsArray = Array();
            pairsArray.push(pairs[i]);
            tokenMap.set(pairs[i].token0.address, pairsArray);
        } else {
            const pairsArray = tokenMap.get(pairs[i].token0.address);
            pairsArray.push(pairs[i]);
        }
        if(!tokenMap.has(pairs[i].token1.address)) {
            const pairsArray = Array();
            pairsArray.push(pairs[i]);
            tokenMap.set(pairs[i].token1.address, pairsArray);
        } else {
            const pairsArray = tokenMap.get(pairs[i].token1.address);
            pairsArray.push(pairs[i]);
        }
    }
    return tokenMap
}
/*createTokenMap();
tokenMap.forEach((v,k) => {
    console.log(k + ": " + v.length);
});*/
//console.log("executed");

function getAllEaEb(tradesCycles) {
    const allEaEb = Array();
    tradesCycles.forEach((tradeCycle) => {
        allEaEb.push(getEaEb8(tradeCycle));
    });
    return allEaEb;
}

function getEaEb6(tradeCycle) {
    //const startCoins = new Set();
    //start_coins.forEach((value) => { startCoins.add(value.address)});
    const tradeCycleLen = tradeCycle.length;
    var startToken = tradeCycle.startToken;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    tradeCycle.path = [startToken];
    tradeCycle.exchangePath = [tradeCycle[0].exchange];
    var Ea = BigInt(r0);//(997 *tradeCycle[0].reserve1 * tradeCycle[1].reserve1)/(1000 * tradeCycle[1].reserve0 + tradeCycle[0].reserve1 * r);
    var Eb = BigInt(r1);//(tradeCycle[0].reserve0 * tradeCycle[1].reserve0)/(tradeCycle[1].reserve0 +  tradeCycle[0].reserve1 * r);)
    for(var i = 1; i < tradeCycle.length; i++) {
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        Ea = (Ea * BigInt(r0) * BigInt(1000))/(BigInt(1000) * BigInt(r0) + Eb * BigInt(997));
        Eb = (Eb * BigInt(r1) * BigInt(997))/(BigInt(1000) * BigInt(r0) + Eb * BigInt(997));
        tradeCycle.path.push(startToken);
        tradeCycle.exchangePath.push(tradeCycle[i].exchange);
        //console.log("Ea: " + Ea);
        //console.log("Eb: " + Eb);
        if(Ea == 0 || Eb == 0) {
            return;
        }
    }
    tradeCycle.path.push(nextToken);
    tradeCycle.decimalInput = tradeCycle[tradeCycleLen - 1].token0.address == nextToken ? tradeCycle[tradeCycleLen - 1].token0.decimal : tradeCycle[tradeCycleLen - 1].token1.decimal
    return [Ea, Eb, startToken];
}

function getEaEb7(tradeCycle) {
    //const startCoins = new Set();
    //start_coins.forEach((value) => { startCoins.add(value.address)});
    const tradeCycleLen = tradeCycle.length;
    var startToken = tradeCycle.startToken;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    //var feeNumerator = tradeCycle[0].fee;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    tradeCycle.path = [startToken];
    tradeCycle.exchangePath = [tradeCycle[0].exchange];
    var Ea = BigInt(r0);//(997 *tradeCycle[0].reserve1 * tradeCycle[1].reserve1)/(1000 * tradeCycle[1].reserve0 + tradeCycle[0].reserve1 * r);
    var Eb = BigInt(r1);//(tradeCycle[0].reserve0 * tradeCycle[1].reserve0)/(tradeCycle[1].reserve0 +  tradeCycle[0].reserve1 * r);)
    for(var i = 1; i < tradeCycle.length; i++) {
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        var feeNumerator = feeNumeratorsMap.get(tradeCycle[i].fee);
        var feeDenominator = feeDenominatorsMap.get(tradeCycle[i].fee);
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        if(r0 == 0 || r1 == 0) return;
        Ea = (Ea * BigInt(r0) * feeDenominator)/(feeDenominator * BigInt(r0) + Eb * feeNumerator);
        Eb = (Eb * BigInt(r1) * feeNumerator)/(feeDenominator * BigInt(r0) + Eb * feeNumerator);
        tradeCycle.path.push(startToken);
        tradeCycle.exchangePath.push(tradeCycle[i].exchange);
        //console.log("Ea: " + Ea);
        //console.log("Eb: " + Eb);
        if(Ea == 0 || Eb == 0) {
            return;
        }
    }
    tradeCycle.path.push(nextToken);
    tradeCycle.decimalInput = tradeCycle[tradeCycleLen - 1].token0.address == nextToken ? tradeCycle[tradeCycleLen - 1].token0.decimal : tradeCycle[tradeCycleLen - 1].token1.decimal
    return [Ea, Eb, startToken];
}

function getEaEb8(tradeCycle) {
    //const startCoins = new Set();
    //start_coins.forEach((value) => { startCoins.add(value.address)});
    const tradeCycleLen = tradeCycle.length;
    var startToken = tradeCycle.startToken;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    //var feeNumerator = tradeCycle[0].fee;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    tradeCycle.path = [startToken];
    tradeCycle.exchangePath = [tradeCycle[0].exchange];
    var Ea = BigInt(r0);//(997 *tradeCycle[0].reserve1 * tradeCycle[1].reserve1)/(1000 * tradeCycle[1].reserve0 + tradeCycle[0].reserve1 * r);
    var Eb = BigInt(r1);//(tradeCycle[0].reserve0 * tradeCycle[1].reserve0)/(tradeCycle[1].reserve0 +  tradeCycle[0].reserve1 * r);)
    for(var i = 1; i < tradeCycle.length; i++) {
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        var feeNumerator = BigInt(tradeCycle[i].feeNumerator);//feeNumeratorsMap.get(tradeCycle[i].fee);
        var feeDenominator = BigInt(tradeCycle[i].feeDenominator);//feeDenominatorsMap.get(tradeCycle[i].fee);
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        if(r0 == 0 || r1 == 0) return;
        Ea = (Ea * BigInt(r0) * feeDenominator)/(feeDenominator * BigInt(r0) + Eb * feeNumerator);
        Eb = (Eb * BigInt(r1) * feeNumerator)/(feeDenominator * BigInt(r0) + Eb * feeNumerator);
        tradeCycle.path.push(startToken);
        tradeCycle.exchangePath.push(tradeCycle[i].exchange);
        //console.log("Ea: " + Ea);
        //console.log("Eb: " + Eb);
        if(Ea == 0 || Eb == 0) {
            return;
        }
    }
    tradeCycle.path.push(nextToken);
    tradeCycle.decimalInput = tradeCycle[tradeCycleLen - 1].token0.address == nextToken ? tradeCycle[tradeCycleLen - 1].token0.decimal : tradeCycle[tradeCycleLen - 1].token1.decimal
    return [Ea, Eb, startToken];
}

function getEaEbCopied(tradeCycle) {
    const startToken = tradeCycle[0].token0.address;
    var Ea = Number(tradeCycle[0].reserve0);
    var Eb = Number(tradeCycle[0].reserve1);
    for(var i = 1; i < tradeCycle.length; i++) {
        var Rb1 = Number(tradeCycle[i].reserve0);
        var Rc = Number(tradeCycle[i].reserve1);
        Ea = (1000*Ea*Rb1)/(1000*Rb1+997*Eb);
        Eb = (997*Eb*Rc)/(1000*Rb1+997*Eb);
        //console.log("Ea: " + Ea);
        //console.log("Eb: " + Eb);
    }
    return [Ea, Eb, startToken];
}

function getOptimalInput(EaEb) {
    return (Math.sqrt(EaEb[0] * EaEb[1] * r) - EaEb[1])/r
}

function getOptimalInput2(EaEb) {
    return (Math.sqrt(EaEb[0] * EaEb[1] * r) - EaEb[0])/r
}
//return Decimal(int((Decimal.sqrt(Ea*Eb*d997*d1000)-Ea*d1000)/d997))
function getOptimalInput3(EaEb) {
    //return Decimal(int((Decimal.sqrt(Ea*Eb*d997*d1000)-Ea*d1000)/d997))

    return (Math.sqrt(Number(Number(EaEb[0]) * Number(EaEb[1]) * 997 * 1000)) - Number(Number(EaEb[0]) * 1000))/Number(997);
}

function getOptimalInput4(EaEb, startFee) {
    //return Decimal(int((Decimal.sqrt(Ea*Eb*d997*d1000)-Ea*d1000)/d997))
    var feeNumerator = feeNumeratorsMap.get(startFee);
    var feeDenominator = feeDenominatorsMap.get(startFee);
    return (Math.sqrt(Number(Number(EaEb[0]) * Number(EaEb[1]) * Number(feeNumerator) * Number(feeDenominator))) - Number(Number(EaEb[0]) * Number(feeDenominator)))/Number(feeNumerator);
}

function getOptimalInput5(EaEb, startFeeNumerator, startFeeDenominator) {
    //return Decimal(int((Decimal.sqrt(Ea*Eb*d997*d1000)-Ea*d1000)/d997))
    var feeNumerator = 999500//startFeeNumerator//tradeCycle[0].feeNumerator;//feeNumeratorsMap.get(startFee);
    var feeDenominator = 1000000//startFeeDenominator//tradeCycle[0].feeDenominator;//feeDenominatorsMap.get(startFee);
    //var r = feeNumerator / feeDenominator;
    const optimalInput = (Math.sqrt(Number(Number(EaEb[0]) * Number(EaEb[1]) * Number(feeNumerator) * Number(feeDenominator))) - Number(Number(EaEb[0]) * Number(feeDenominator)))/Number(feeNumerator);
    //const optimalInput = (Math.sqrt(Number(EaEb[0]) * Number(EaEb[1])) - Number(EaEb[0]));
    if(!optimalInput) {
        console.log("NaN");
    }
    return optimalInput;
}

function getOptimalProfit(EaEb, optimalInput) {
    const aprime = (EaEb[0] * r * optimalInput) / (EaEb[1] + r * optimalInput);
    return BigInt(aprime - optimalInput);
}

function getOptimalProfit2(EaEb, optimalInput) {
    const aprime = (EaEb[1] * r * optimalInput) / (EaEb[0] + r * optimalInput);
    return aprime - optimalInput;
}

function getOptimalProfit3(EaEb, optimalInput) {
    optimalInput = Math.floor(optimalInput);
    const aprime = BigInt((BigInt(EaEb[1]) *BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * BigInt(EaEb[0]) + BigInt(optimalInput) * BigInt(997)));
    //const aprime = getAprime()
    console.log(aprime);
    return aprime - BigInt(optimalInput);
}

function getOptimalProfit4(tradeCycle, optimalInput) {
    optimalInput = Math.floor(optimalInput);
    //const aprime = BigInt((BigInt(EaEb[1]) *BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * BigInt(EaEb[0]) + BigInt(optimalInput) * BigInt(997)));
    const aprime = getAprime2(tradeCycle, optimalInput);
    //console.log(aprime);
    return aprime - BigInt(optimalInput);
}

function getOptimalProfit5(tradeCycle, optimalInput) {
    optimalInput = Math.floor(optimalInput);
    //const aprime = BigInt((BigInt(EaEb[1]) *BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * BigInt(EaEb[0]) + BigInt(optimalInput) * BigInt(997)));
    const aprime = getAprime3(tradeCycle, optimalInput);
    //console.log(aprime);
    return aprime - BigInt(optimalInput);
}

function getOptimalProfit6(tradeCycle, optimalInput) {
    optimalInput = Math.floor(optimalInput);
    
    const aprime = getAprime4(tradeCycle, optimalInput);
    //console.log(aprime);
    return aprime - BigInt(optimalInput);
}

function getOptimalProfit7(tradeCycle, optimalInput) {
    optimalInput = Math.floor(optimalInput);
    
    const aprime = getAprime5(tradeCycle, optimalInput);
    //console.log(aprime);
    return aprime - BigInt(optimalInput);
}

function getOptimalProfit8(tradeCycle, optimalInput) {
    optimalInput = Math.floor(optimalInput);
    
    const aprime = getAprime6(tradeCycle, optimalInput);
    //console.log(aprime);
    return aprime - BigInt(optimalInput);
}

function getAprime(tradeCycle, optimalInput) {
    //for(var i = )
    var a = (tradeCycle[0].reserve1 * BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * tradeCycle[0].reserve0 + BigInt(optimalInput) * BigInt(997));
    for(var i = 1; i < tradeCycle.length; i++) {
        a = (tradeCycle[i].reserve1 * BigInt(997) * a) / (BigInt(1000) * tradeCycle[i].reserve0 + a * BigInt(997));
    }
    return a;
}

function getAprime2(tradeCycle, optimalInput) {
    //for(var i = )
    var startToken = tradeCycle[0].token0.address != tradeCycle[1].token0.address && tradeCycle[0].token0.address != tradeCycle[1].token1.address ? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var a = (r1 * BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * r0 + BigInt(optimalInput) * BigInt(997));
    for(var i = 1; i < tradeCycle.length; i++) {
        startToken = tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        a = (r1 * BigInt(997) * a) / (BigInt(1000) * r0 + a * BigInt(997));
    }
    return a;
}

function getAprime3(tradeCycle, optimalInput) {
    //for(var i = )
    const startCoins = new Set();
    start_coins.forEach((value) => { startCoins.add(value.address)});
    const tradeCycleLen = tradeCycle.length;
    const firstPairTokens = new Set();
    const lastPairTokens = new Set();
    firstPairTokens.add(tradeCycle[0].token0.address);
    firstPairTokens.add(tradeCycle[0].token1.address);
    lastPairTokens.add(tradeCycle[tradeCycleLen - 1].token0.address);
    lastPairTokens.add(tradeCycle[tradeCycleLen - 1].token1.address);
    //const startToken = tradeCycle[0].token0.address;
    //var startToken = tradeCycle[0].token0.address != tradeCycle[1].token0.address && tradeCycle[0].token0.address != tradeCycle[1].token1.address ? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var startToken = startCoins.has(tradeCycle[0].token0.address) && firstPairTokens.has(tradeCycle[0].token0.address) && lastPairTokens.has(tradeCycle[0].token0.address)? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var a = (r1 * BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * r0 + BigInt(optimalInput) * BigInt(997));
    for(var i = 1; i < tradeCycle.length; i++) {
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        a = (r1 * BigInt(997) * a) / (BigInt(1000) * r0 + a * BigInt(997));
    }
    return a;
}

function getAprime4(tradeCycle, optimalInput) {
    const tradeCycleLen = tradeCycle.length;
    //const startToken = tradeCycle[0].token0.address;
    //var startToken = tradeCycle[0].token0.address != tradeCycle[1].token0.address && tradeCycle[0].token0.address != tradeCycle[1].token1.address ? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var startToken = tradeCycle.startToken;//startCoins.has(tradeCycle[0].token0.address) && firstPairTokens.has(tradeCycle[0].token0.address) && lastPairTokens.has(tradeCycle[0].token0.address)? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var a = (r1 * BigInt(997) * BigInt(optimalInput)) / (BigInt(1000) * r0 + BigInt(optimalInput) * BigInt(997));
    for(var i = 1; i < tradeCycle.length; i++) {
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        a = (r1 * BigInt(997) * a) / (BigInt(1000) * r0 + a * BigInt(997));
    }
    return a;
}

function getAprime5(tradeCycle, optimalInput) {
    const tradeCycleLen = tradeCycle.length;
    //const startToken = tradeCycle[0].token0.address;
    //var startToken = tradeCycle[0].token0.address != tradeCycle[1].token0.address && tradeCycle[0].token0.address != tradeCycle[1].token1.address ? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var startToken = tradeCycle.startToken;//startCoins.has(tradeCycle[0].token0.address) && firstPairTokens.has(tradeCycle[0].token0.address) && lastPairTokens.has(tradeCycle[0].token0.address)? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var feeNumerator = feeNumeratorsMap.get(tradeCycle[0].fee);
    var feeDenominator = feeDenominatorsMap.get(tradeCycle[0].fee);
    var a = (r1 * feeNumerator * BigInt(optimalInput)) / (feeDenominator * r0 + BigInt(optimalInput) * feeNumerator);
    for(var i = 1; i < tradeCycle.length; i++) {
        feeNumerator = feeNumeratorsMap.get(tradeCycle[i].fee);
        feeDenominator = feeDenominatorsMap.get(tradeCycle[i].fee);
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        a = (r1 * feeNumerator * a) / (feeDenominator * r0 + a * feeNumerator);
    }
    return a;
}

function getAprime6(tradeCycle, optimalInput) {
    const tradeCycleLen = tradeCycle.length;
    //const startToken = tradeCycle[0].token0.address;
    //var startToken = tradeCycle[0].token0.address != tradeCycle[1].token0.address && tradeCycle[0].token0.address != tradeCycle[1].token1.address ? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var startToken = tradeCycle.startToken;//startCoins.has(tradeCycle[0].token0.address) && firstPairTokens.has(tradeCycle[0].token0.address) && lastPairTokens.has(tradeCycle[0].token0.address)? tradeCycle[0].token0.address : tradeCycle[0].token1.address;
    var nextToken = tradeCycle[0].token0.address == startToken ? tradeCycle[0].token1.address : tradeCycle[0].token0.address;
    var r0 = startToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var r1 = nextToken == tradeCycle[0].token0.address ? tradeCycle[0].reserve0 : tradeCycle[0].reserve1;
    var feeNumerator = BigInt(tradeCycle[0].feeNumerator);//feeNumeratorsMap.get(tradeCycle[0].fee);
    var feeDenominator = BigInt(tradeCycle[0].feeDenominator);//feeDenominatorsMap.get(tradeCycle[0].fee);
    var a = (r1 * feeNumerator * BigInt(optimalInput)) / (feeDenominator * r0 + BigInt(optimalInput) * feeNumerator);
    for(var i = 1; i < tradeCycle.length; i++) {
        feeNumerator = BigInt(tradeCycle[i].feeNumerator);//feeNumeratorsMap.get(tradeCycle[i].fee);
        feeDenominator = BigInt(tradeCycle[i].feeDenominator);//feeDenominatorsMap.get(tradeCycle[i].fee);
        startToken = nextToken;//tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token0.address && tradeCycle[i].token0.address != tradeCycle[(i + 1) % tradeCycle.length].token1.address ? tradeCycle[i].token0.address : tradeCycle[i].token1.address;
        nextToken = tradeCycle[i].token0.address == startToken ? tradeCycle[i].token1.address : tradeCycle[i].token0.address;
        r0 = startToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        r1 = nextToken == tradeCycle[i].token0.address ? tradeCycle[i].reserve0 : tradeCycle[i].reserve1;
        a = (r1 * feeNumerator * a) / (feeDenominator * r0 + a * feeNumerator);
    }
    return a;
}

function getProfitableTrades(tradesCycles) {
    const trades = Array();
    const allEaEb = getAllEaEb(tradesCycles);
    allEaEb.forEach((EaEb, idx) => {
        if(EaEb && EaEb[0] < EaEb[1]) {
            var optimalInput = getOptimalInput5(EaEb, tradesCycles[idx][0].feeNumerator, tradesCycles[idx][0].feeDenominator);

            const optimalProfit = getOptimalProfit8(tradesCycles[idx], optimalInput);
            if(/*optimalProfit > 0 &&*/ optimalInput > 0) {
                //trades.push({"optimalInput": optimalInput, "optimalProfit": optimalProfit, "inputToken": tradesCycles[idx].t})
                var trade = {}
                trade.optimalInput = optimalInput;
                trade.decimalInput = tradesCycles[idx].decimalInput;
                trade.optimalProfit = Number(optimalProfit);
                getOptimalProfitUSD(optimalProfit, tradesCycles[idx].startToken, trade);
                //trade.tradeCycle = tradesCycles[idx];
                trade.tradeCycle = tradesCycles[idx];
                trade.path = tradesCycles[idx].path;//getTradePath(tradesCycles[idx]);
                trade.exchangePath = tradesCycles[idx].exchangePath;
                trade.exchangeToTradePath = exchangeToTradePath(tradesCycles[idx]);
                trade.exchangeToFeesPath = exchangeToFeesPath(tradesCycles[idx]);
                trade.exchangeToPoolsPath = exchangeToPoolAddresses(tradesCycles[idx]);
                trade.ea = EaEb[0];
                trade.eb = EaEb[1];
                trades.push(trade);
            }
        }
        
    })
    return trades;
}

function getOptimalProfitUSD(optimalProfit, token, trade) {
        trade.optimalProfitUSD = (Number(optimalProfit) / Math.pow(10, trade.decimalInput)) * prices.getTokenPrice(token);
}

function getTradePath(tradeCycle) {
    const path = [];
    for(var i = 0; i < tradeCycle.length; i++) {
        path.push(tradeCycle[i].token0.address);
    }
    path.push(tradeCycle[tradeCycle.length - 1].token1.address);
    return path;
}

function orderPairs(pairCycle) {
     for(var i = 0; i < pairCycle.length; i++) {
        var firstPair = pairCycle[i];
        var nextPair = pairCycle[(i + 1) % pairCycle.length];
        var startToken = firstPair.token0.address != nextPair.token0.address 
                    && firstPair.token0.address != nextPair.token1.address ? firstPair.token0 : firstPair.token1
        var nextToken = firstPair.token0.address != startToken.address ? firstPair.token0 : firstPair.token1
        if(firstPair.token0.address != startToken.address) {
            firstPair.token0 = startToken;
            firstPair.token1 = nextToken;
            const temp = firstPair.reserve0;
            firstPair.reserve0 = firstPair.reserve1;
            firstPair.reserve1 = temp;
        }
     }
}

async function updateReserves(pairs, arbContract) {
    for(var i = 0; i < pairs.length; i++) {
        const reserves = await arbContract.getReserves(pairs[i].address);
        pairs[i].reserve0 = BigInt(reserves[0]._hex);
        pairs[i].reserve1 = BigInt(reserves[1]._hex);
    }
}

async function updateReserves2(pairs, arbContract) {
    var reqs = [];
    for(var i = 0; i < pairs.length; i++) {
        reqs.push(arbContract.getReserves(pairs[i].address))
    }
    await Promise.all(reqs).then(function(results) {
        //console.log(results);
        results.forEach((reserves, idx) => {
            pairs[idx].reserve0 = BigInt(reserves[0]._hex);
            pairs[idx].reserve1 = BigInt(reserves[1]._hex);
        })
    })
}

async function updateReserves3(tradesCycles, arbContract) { 
    var pools = [];
    var visited = new Set();
    var hm = new Map();
    for(var i = 0; i < tradesCycles.length; i++) {
        for(var j = 0; j < tradesCycles[i].length; j++) {
            if(!visited.has(tradesCycles[i][j].address)) {
                hm.set(tradesCycles[i][j].address, tradesCycles[i][j]);
                pools.push(tradesCycles[i][j].address);
                visited.add(tradesCycles[i][j].address);
            }
        }
    }
    var result = await arbContract.getReserves2(pools);
    result.forEach((reserves) => {
        var poolAddress = reserves[2];
        poolAddress = poolAddress.toLowerCase();
        hm.get(poolAddress).reserve0 = BigInt(reserves[0]._hex);
        hm.get(poolAddress).reserve1 = BigInt(reserves[1]._hex);
    });
    //console.log(result);
    /*
    ethers.utils.defaultAbiCoder.decode(
    [ 'bytes', 'string' ],
    hexDataSlice(tx.data, 4)
    )*/

}

async function updateReserves4(tradesCycles, arbContract) { 
    const uniAndSushiPoolAddrs = new Set();
    const uniV3PoolAddrs = new Set();
    const balancerPoolAddrs = new Set();
    var hm = new Map();
    for(var i = 0; i < tradesCycles.length; i++) {
        for(var j = 0; j < tradesCycles[i].length; j++) {
            hm.set(tradesCycles[i][j].address, tradesCycles[i][j]);
            if(tradesCycles[i][j].exchange == "uni_v3") {
                uniV3PoolAddrs.add(tradesCycles[i][j].address);
            } else if(tradesCycles[i][j].exchange == "balancer") {
                balancerPoolAddrs.add(tradesCycles[i][j].address);
            } else {
                uniAndSushiPoolAddrs.add(tradesCycles[i][j].address);
            }
        }
    }//0x9d96880952b4c80a55099b9c258250f2cc5813ec
    var reservesUniAndSushi = await arbContract.getReserves2(Array.from(uniAndSushiPoolAddrs));
    var reservesUniV3 = await arbContract.getReservesUni3(Array.from(uniV3PoolAddrs));
    var reservesBalancer = await arbContract.getReservesBalancer(Array.from(balancerPoolAddrs));
    var reserves = [...reservesUniV3, ...reservesUniAndSushi, ... reservesBalancer];
    reserves.forEach((reserve) => {
        var poolAddress = reserve[2];
        poolAddress = poolAddress.toLowerCase();
        const reserve0 = BigInt(reserve[0]._hex);
        const reserve1 = BigInt(reserve[1]._hex);
        hm.get(poolAddress).reserve0 = BigInt(reserve[0]._hex);
        hm.get(poolAddress).reserve1 = BigInt(reserve[1]._hex);
    });
    //Array.from(


}

async function updateReservesDirectFromUniswap(tradesCycles, provider, uniswapPairABI) { 
    var pools = [];
    var visited = new Set();
    var hm = new Map();
    for(var i = 0; i < tradesCycles.length; i++) {
        for(var j = 0; j < tradesCycles[i].length; j++) {
            if(!visited.has(tradesCycles[i][j].address)) {
                hm.set(tradesCycles[i][j].address, tradesCycles[i][j]);
                pools.push(tradesCycles[i][j].address);
                visited.add(tradesCycles[i][j].address);
            }
        }
    }
    //var result = await arbContract.getReserves2(pools);    
    for(var i = 0; i < pools.length; i++) {
        var poolAddress = pools[i];
        var pairContract = new ethers.Contract(poolAddress, uniswapPairABI, provider);
        var reserves = await pairContract.getReserves();
        //console.log("reserves: " + reserves);
        hm.get(poolAddress).reserve0 = BigInt(reserves[0]._hex);
        hm.get(poolAddress).reserve1 = BigInt(reserves[1]._hex);
    }
    //console.log(result);
    /*
    ethers.utils.defaultAbiCoder.decode(
    [ 'bytes', 'string' ],
    hexDataSlice(tx.data, 4)
    )*/

}
//inputs.push({ target: priceFeedAddress, function: 'getRoundData', args: [round.toString()] })

async function updateReservesDirectFromUniswap2(tradesCycles, provider, uniswapPairABI, uniswapV3PoolABI) { 
    const uniAndSushiPoolAddrs = new Set();
    const uniV3PoolAddrs = new Set();
    var hm = new Map();
    for(var i = 0; i < tradesCycles.length; i++) {
        for(var j = 0; j < tradesCycles[i].length; j++) {
            hm.set(tradesCycles[i][j].address, tradesCycles[i][j]);
            if(tradesCycles[i][j].exchange == "uni_v3") {
                uniV3PoolAddrs.add(tradesCycles[i][j].address);
            } else {
                uniAndSushiPoolAddrs.add(tradesCycles[i][j].address);
            }
        }
    }
    const uniV3PoolAddrsArr = Array.from(uniV3PoolAddrs);
    const uniAndSushiPoolAddrsArr = Array.from(uniAndSushiPoolAddrs);
    for(var i = 0; i < uniV3PoolAddrsArr.length; i++) {
        var v3PoolContract = new ethers.Contract(uniV3PoolAddrsArr[i], uniswapV3PoolABI, provider);
        var resLiquidity = await v3PoolContract.liquidity();
        var liquidity = BigInt(resLiquidity._hex)
        var slot0 = await v3PoolContract.slot0();
        var sqrtPrice = BigInt(slot0[0]._hex);
        //uint256 reserve0 = (uint256(liquidity) << 96) / sqrtPrice;
        //uint256 reserve1 = FullMath.mulDiv(uint256(liquidity), sqrtPrice, 2 ** (96));
        var liquidityMul = bigDecimal.multiply(liquidity, Math.pow(2, 96));
        var reserve0 = bigDecimal.divide(liquidityMul, sqrtPrice);
        var reserve1 = bigDecimal.divide(bigDecimal.multiply(liquidity, sqrtPrice), Math.pow(2, 96));
        hm.get(uniV3PoolAddrsArr[i]).reserve0 = BigInt(Math.floor(Number(reserve0)));
        hm.get(uniV3PoolAddrsArr[i]).reserve1 = BigInt(Math.floor(Number(reserve1)));
        //const reserve0 = bigDecimal.mul
    }
    for(var i = 0; i < uniAndSushiPoolAddrsArr.length; i++) {
        var poolAddress = uniAndSushiPoolAddrsArr[i];
        var pairContract = new ethers.Contract(poolAddress, uniswapPairABI, provider);
        var reserves = await pairContract.getReserves();
        //console.log("reserves: " + reserves);
        hm.get(poolAddress).reserve0 = BigInt(reserves[0]._hex);
        hm.get(poolAddress).reserve1 = BigInt(reserves[1]._hex);
    }
}

function sortTrades(trades) {
    trades.sort((a,b) => b.optimalProfitUSD - a.optimalProfitUSD);
}

function sqrt(value) {
    var x = BigInt(1);
    while(x * x < value) {
        x*=BigInt(2);
    }
    while(x * x < value) {
        x++;
    }
    return x;
}

function exchangeToTradePath(tradeCycle) {
    const exchangeNames = tradeCycle.exchangePath
    const tradePath = tradeCycle.path;
    const res = [{exchange: exchangeNames[0], _path: [tradePath[0]]}]
    var prevExch = exchangeNames[0]
    for(var i = 1 ; i < tradeCycle.exchangePath.length; i++) {
        res[res.length - 1]._path.push(tradePath[i])
        if(exchangeNames[i] != prevExch) {
            //res[res.length - 1]._path.push(tradeCycle.path[i])
            res.push({exchange: exchangeNames[i], _path: [tradePath[i]]})
        }
        prevExch = exchangeNames[i];
    }
    res[res.length - 1]._path.push(tradePath[tradePath.length - 1]);
    return res;
}

function exchangeToFeesPath(tradeCycle) {
    const exchangeNames = tradeCycle.exchangePath;
    const res = [{exchange: exchangeNames[0], fees: [BigInt(tradeCycle[0].fee)]}]
    var prevExch = exchangeNames[0]
    for(var i = 1; i < exchangeNames.length; i++) {
        //res[res.length - 1].fees.push(tradeCycle)
        if(exchangeNames[i] == prevExch) {
            res[res.length - 1].fees.push(BigInt(tradeCycle[i].fee));
        } else {
            res.push({exchange: exchangeNames[i], fees: [BigInt(tradeCycle[i].fee)]});
        }
        prevExch = exchangeNames[i];
    }
    return res;
}

function exchangeToPoolAddresses(tradeCycle) {
    const exchangeNames = tradeCycle.exchangePath;
    const res = [{exchange: exchangeNames[0], poolAddresses: [tradeCycle[0].address]}]
    var prevExch = exchangeNames[0]
    for(var i = 1; i < exchangeNames.length; i++) {
        //res[res.length - 1].fees.push(tradeCycle)
        if(exchangeNames[i] == prevExch) {
            res[res.length - 1].poolAddresses.push(tradeCycle[i].address);
        } else {
            res.push({exchange: exchangeNames[i], poolAddresses: [tradeCycle[i].address]});
        }
        prevExch = exchangeNames[i];
    }
    return res;
}

function getAllExchanges(exchangeToTradePath) {
    const exchanges = [];
    for(var i = 0; i < exchangeToTradePath.length; i++) {
        exchanges.push(exchangeToTradePath[i].exchange);
    }
    return exchanges;
}

function getAllPaths(exchangeToTradePath) {
    const paths = [];
    for(var i = 0; i < exchangeToTradePath.length; i++) {
        paths.push(exchangeToTradePath[i]._path);
    }
    return paths;
}

function getAllFees(exchangeToFeesPath) {
    const fees = [];
    for(var i = 0; i < exchangeToFeesPath.length; i++) {
        fees.push(exchangeToFeesPath[i].fees);
    }
    return fees;
}

function getAllPools(exchangeToPoolsPath) {
    const pools = [];
    for(var i = 0; i < exchangeToPoolsPath.length; i++) {
        pools.push(exchangeToPoolsPath[i].poolAddresses);
    }
    return pools;
}

module.exports.getAllEaEb = getAllEaEb;
module.exports.createTokenMap = createTokenMap;
module.exports.getOptimalInput3 = getOptimalInput3;
module.exports.getOptimalProfit = getOptimalProfit;
module.exports.getProfitableTrades = getProfitableTrades;
module.exports.orderPairs = orderPairs;
module.exports.updateReserves = updateReserves;
module.exports.sortTrades = sortTrades;
module.exports.getEaEbCopied = getEaEbCopied;
module.exports.getAprime = getAprime;
module.exports.getTradePath = getTradePath;
module.exports.getAprime2 = getAprime2;
module.exports.getOptimalProfit4 = getOptimalProfit4;
module.exports.updateReserves2 = updateReserves2;
module.exports.updateReserves3 = updateReserves3;
module.exports.updateReservesDirectFromUniswap = updateReservesDirectFromUniswap;
module.exports.getOptimalProfit5 = getOptimalProfit5;
module.exports.getAllExchanges = getAllExchanges;
module.exports.getAllPaths = getAllPaths;
module.exports.getOptimalProfit6 = getOptimalProfit6;
module.exports.getEaEb6 = getEaEb6;
module.exports.updateReserves4 = updateReserves4;
module.exports.getEaEb7 = getEaEb7;
module.exports.getOptimalProfit5 = getOptimalProfit5;
module.exports.getOptimalInput4 = getOptimalInput4;
module.exports.getOptimalProfit7 = getOptimalProfit7;
module.exports.updateReservesDirectFromUniswap2 = updateReservesDirectFromUniswap2;
module.exports.getAllFees = getAllFees;
module.exports.getOptimalProfitUSD = getOptimalProfitUSD;
module.exports.getEaEb8 = getEaEb8;
module.exports.getOptimalInput5 = getOptimalInput5;
module.exports.getOptimalProfit8 = getOptimalProfit8;
module.exports.getAllPools = getAllPools;
