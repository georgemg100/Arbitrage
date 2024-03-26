const { expect } = require("chai");
const { getCreate2Address } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const AAVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const ARB_CONTRACT_NAME = "ArbContract";
//init specific trade cycle
  //run fork of mainnet and find profitable trade
  //copy json of trade cycle from the logs
  //use it to innit tradecycle in test 
const uniV3PoolABI = require("./univ3poolabi.json")
const testTrade = require("./testTrade.json")
const common = require("../scripts/common.js");

/*describe("Greeter", function() {
  it("Should return the new greeting once it's changed", async function() {
    const Greeter = await ethers.getContractFactory("Greeter");
    const greeter = await Greeter.deploy("Hello, world!");
    
    await greeter.deployed();
    expect(await greeter.greet()).to.equal("Hello, world!");

    await greeter.setGreeting("Hola, mundo!");
    expect(await greeter.greet()).to.equal("Hola, mundo!");
  });
});*/

describe("Greeter", function() {
  it("should deploy", async function() {
    const ArbContract = await ethers.getContractFactory(ARB_CONTRACT_NAME);
    //const arbContract = await ArbContract.deploy(AAVE_PROVIDER);
    // await arbContract.deployed()
  });
})

describe("ArbContract", function() {
  it("should do arb trade on fork of mainnet", async function() {
    const ArbContract = await ethers.getContractFactory(ARB_CONTRACT_NAME);
    const arbContract = await ArbContract.deploy(AAVE_PROVIDER);
    await arbContract.deployed()
    const testTradeCycle = testTrade.tradeCycle
    testTradeCycle.startToken = '0x6b175474e89094c44da98b954eedeac495271d0f';
    testTradeCycle[0].reserve0 = BigInt(testTradeCycle[0].reserve0)
    testTradeCycle[0].reserve1 = BigInt(testTradeCycle[0].reserve1)
    testTradeCycle[1].reserve0 = BigInt(testTradeCycle[1].reserve0)
    testTradeCycle[1].reserve1 = BigInt(testTradeCycle[1].reserve1)
    testTradeCycle[2].reserve0 = BigInt(testTradeCycle[2].reserve0)
    testTradeCycle[2].reserve1 = BigInt(testTradeCycle[2].reserve1)
    //calculate optimal profit from trade cycle
    const EaEb = common.getEaEb8(testTradeCycle)
    console.log('EaEb', EaEb)
    const optimalInput = common.getOptimalInput5(EaEb, 0, 0);
    console.log('optimalInput', optimalInput)
    const aprime = common.getAprime6(testTradeCycle, optimalInput);
    console.log('balance after swap (aprime)', aprime)
    const optimalProfit = common.getOptimalProfit8(testTradeCycle, optimalInput);
    console.log('optimalProfit', optimalProfit)
    const PERCENT_TO_COINBASE = 5650;

    //execute trades on each pool to see if the math matches calculation
    //copied from tests.js
    await arbContract.callLendingPool(
      [testTrade.path[0]],
      [optimalInput],
      testTrade.exchangeToTradePath,
      common.getAllPaths(testTrade.exchangeToTradePath),
      common.getAllExchanges(testTrade.exchangeToTradePath),
      common.getAllFees(testTrade.exchangeToFeesPath),
      common.getAllPools(testTrade.exchangeToPoolsPath),
      PERCENT_TO_COINBASE
      );
    //execute trade against contract
    //compare actual profit against calculated profit
  })
})
