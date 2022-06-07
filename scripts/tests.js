const common = require("./common.js");
const hre = require("hardhat");
const { ethers } = require("hardhat");
const uniswapV2PairJSON = require("../artifacts/contracts/IUniswapV2Pair.sol/IUniswapV2Pair.json")
const AVVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
//const process = require('node:process');


tradeCycleOrdered = [
    {
      index: 0,
      address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
      token0: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      token1: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      reserve0: 176560092727090,
      reserve1: 5.2459530415773e+23,
    },
    {
      index: 3,
      address: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
      token0: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      token1: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      reserve0: 4.419918223163325e+23,
      reserve1: 1.4775652624803158e+26,
    },
    {
      index: 5,
      address: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5",
      token0: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      token1: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      reserve0: 1.916219085245779e+24,
      reserve1: 1929099476762,
    },
  ]

  tradeCycleUnOrdered = [
    {
      index: 0,
      address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
      token0: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      token1: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      reserve0: 176560092727090,
      reserve1: 5.2459530415773e+23,
    },
    {
      index: 3,
      address: "0xA478c2975Ab1Ea89e8196811F51A7B7Ade33eB11",
      token0: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      token1: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      reserve0: 1.4775652624803158e+26,
      reserve1: 4.419918223163325e+23,
    },
    {
      index: 5,
      address: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5",
      token0: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      token1: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      reserve0: 1.916219085245779e+24,
      reserve1: 1929099476762,
    },
  ]

const tradeCycleNegativeProfit = [
    {
      index: 52,
      address: "0x919B599ecB6C9a474a046d1252b2F41f8047dECB",
      token0: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      token1: {
        address: "0xea5f88E54d982Cbb0c441cde4E79bC305e5b43Bc",
        symbol: "PARETO",
        decimal: 18,
      },
      reserve0: 196741201866553635n,
      reserve1: 4694001570782919156272149n,
    },
    {
      index: 87,
      address: "0x7Ba2c8af503d311958d20614F3eDE2a9C3464C7A",
      token0: {
        address: "0xea5f88E54d982Cbb0c441cde4E79bC305e5b43Bc",
        symbol: "PARETO",
        decimal: 18,
      },
      token1: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      reserve0: 2371731772960251452524603n,
      reserve1: 412100046975352153256n,
    },
    {
      index: 5,
      address: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5",
      token0: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      token1: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      reserve0: 47183727667138292317890014n,
      reserve1: 47195841083140n,
    },
    {
      index: 0,
      address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
      token0: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      token1: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      reserve0: 102811661749854n,
      reserve1: 31623024312244938879707n,
    },
  ]

  // var tradeCycleResultsZero = [
  //   {
  //     index: 0,
  //     address: '0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc',
  //     token0: [Object],
  //     token1: [Object],
  //     reserve0: 102811660173641n,
  //     reserve1: 31623024798518732582165n
  //   },
  //   {
  //     index: 5,
  //     address: '0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5',
  //     token0: [Object],
  //     token1: [Object],
  //     reserve0: 47183727667138292317890014n,
  //     reserve1: 47195841083140n
  //   },
  //   {
  //     index: 88,
  //     address: '0x08a564924C26D8289503bbaA18714B9C366dF9a5',
  //     token0: [Object],
  //     token1: [Object],
  //     reserve0: 149493021840585256202n,
  //     reserve1: 159135656280n
  //   },
  //   {
  //     index: 30,
  //     address: '0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c',
  //     token0: [Object],
  //     token1: [Object],
  //     reserve0: 1024017629831086065443n,
  //     reserve1: 3216369603088534n
  //   }
  // ]

  var tradeCycleResultsZero = [
    {
      index: 0,
      address: "0xB4e16d0168e52d35CaCD2c6185b44281Ec28C9Dc",
      token0: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      token1: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      reserve0: 102811660173641n,
      reserve1: 31623024798518732582165n,
    },
    {
      index: 5,
      address: "0xAE461cA67B15dc8dc81CE7615e0320dA1A9aB8D5",
      token0: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      token1: {
        address: "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48",
        symbol: "USDC",
        decimal: 6,
      },
      reserve0: 47183727667138292317890014n,
      reserve1: 47195841083140n,
    },
    {
      index: 88,
      address: "0x08a564924C26D8289503bbaA18714B9C366dF9a5",
      token0: {
        address: "0x6B175474E89094C44Da98b954EedeAC495271d0F",
        symbol: "DAI",
        decimal: 18,
      },
      token1: {
        address: "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
        symbol: "AMPL",
        decimal: 9,
      },
      reserve0: 149493021840585256202n,
      reserve1: 159135656280n,
    },
    {
      index: 30,
      address: "0xc5be99A02C6857f9Eac67BbCE58DF5572498F40c",
      token0: {
        address: "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2",
        symbol: "WETH",
        decimal: 18,
      },
      token1: {
        address: "0xD46bA6D942050d489DBd938a2C909A5d5039A161",
        symbol: "AMPL",
        decimal: 9,
      },
      reserve0: 1024017629831086065443n,
      reserve1: 3216369603088534n,
    },
  ]

function testGetOptimalProfit() {
    var r = 1 - .003;
    const EaEb = common.getEaEb3(tradeCycleOrdered);
    console.log(EaEb);
    
    const optimalInput = common.getOptimalInput3(EaEb);
    const aprime = (Number(EaEb[1]) * 997 * optimalInput) / (1000 * Number(EaEb[0]) + optimalInput * 997);
    console.log(EaEb);
    console.log("optimalInput: " + optimalInput);
    console.log("aprime: " + aprime);
    const b = (tradeCycleOrdered[0].reserve1 * 997 * optimalInput) / (1000 * tradeCycleOrdered[0].reserve0 + optimalInput * 997);
    const c = (tradeCycleOrdered[1].reserve1 * 997 * b) / (1000 * tradeCycleOrdered[1].reserve0 + b * 997);
    const aprimesecond = (tradeCycleOrdered[2].reserve1 * 997 * c) / (1000 * tradeCycleOrdered[2].reserve0 + 997 * c);
    console.log("aprimesecond: " + aprimesecond);
}

function testGetOptimalProfitUnordered() {
  var r = 1 - .003;
  const EaEb = common.getEaEb4(tradeCycleUnOrdered);
  console.log(EaEb);
  
  const optimalInput = common.getOptimalInput3(EaEb);
  const aprime = (Number(EaEb[1]) * 997 * optimalInput) / (1000 * Number(EaEb[0]) + optimalInput * 997);
  console.log(EaEb);
  console.log(tradeCycleUnOrdered.path);
  console.log("optimalInput: " + optimalInput);
  console.log("aprime: " + aprime);
  //const b = (tradeCycle[0].reserve1 * 997 * optimalInput) / (1000 * tradeCycle[0].reserve0 + optimalInput * 997);
  //const c = (tradeCycle[1].reserve1 * 997 * b) / (1000 * tradeCycle[1].reserve0 + b * 997);
  //const aprimesecond = (tradeCycle[2].reserve1 * 997 * c) / (1000 * tradeCycle[2].reserve0 + 997 * c);
  //console.log("aprimesecond: " + aprimesecond);
}

async function testNegativeProfit() {
    const ArbContract = await hre.ethers.getContractFactory("ArbContract");
    const arbContract = await ArbContract.deploy(AVVE_PROVIDER);

    const EaEb = common.getEaEb4(tradeCycleNegativeProfit);
    const optimalInput = common.getOptimalInput3(EaEb);
    const aprime = common.getAprime2(tradeCycleNegativeProfit, Math.floor(optimalInput))
    console.log("aprime: " + aprime);
    console.log("optimalInput: " + optimalInput);
    console.log("profit: " + (aprime - BigInt(Math.floor(optimalInput))));

    const tx = await arbContract.callLendingPool(
        [tradeCycleNegativeProfit[0].token0.address],
        [BigInt(Math.floor(optimalInput))],
        [0],
        '0x10',
        '0',
        common.getTradePath(tradeCycleNegativeProfit)
      );
}

async function testTradeResultsInZero() {
  const ArbContract = await hre.ethers.getContractFactory("ArbContract");
  const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
  
  const EaEb = common.getEaEb4(tradeCycleResultsZero);
  const optimalInput = common.getOptimalInput3(EaEb);
  const aprime = common.getAprime2(tradeCycleResultsZero, Math.floor(optimalInput));
  const optimalProfit = common.getOptimalProfit4(tradeCycleResultsZero, optimalInput);
  console.log("aprime: " + aprime);
  console.log(EaEb);
  console.log("optimalInput: " + optimalInput);
  console.log("optimalProfit: " + optimalProfit);
  console.log("tradeCycle path: " + tradeCycleResultsZero.path);
  //console.log("profit: " + (aprime - BigInt(optimalInput)));

  const tx = await arbContract.callLendingPool(
      [tradeCycleResultsZero.path[0]],
      [BigInt(Math.floor(optimalInput))],
      [0],
      '0x10',
      '0',
      tradeCycleResultsZero.path
    );
}

async function testUpdateReservesDirectFromUniswap() {
  //console.log(await ethers.getDefaultProvider().getNetwork());
  //console.log(await ethers.getDefaultProvider().getBlockNumber());
  common.updateReservesDirectFromUniswap([tradeCycleNegativeProfit], ethers.getDefaultProvider(), uniswapV2PairJSON.abi);
}
/*async function testUpdateReserves() {
  var tradesCycles = 
}*/

async function testUpdateReservesUni3() {
  const ArbContract = await hre.ethers.getContractFactory("ArbContract");
  const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
  const poolAddrs = ["0x6c6bc977e13df9b0de53b251522280bb72383700"];
  var results = await arbContract.getReservesUni3(poolAddrs);
  console.log(results);
}

async function testUpdateReservesBalancer() {
  const ArbContract = await hre.ethers.getContractFactory("ArbContract");
  const arbContract = await ArbContract.deploy(AVVE_PROVIDER);
  const poolAddrs = ["0x5c6ee304399dbdb9c8ef030ab642b10820db8f56"];
  var results = await arbContract.getReservesBalancer(poolAddrs);
  console.log("results: ");
  console.log(results);
}

async function testGetPairDataBalancer() {
  const PairContract = await hre.ethers.getContractFactory("Pairs");
  const pairContract = await PairContract.deploy();
  const poolAddrs = ["0x5c6ee304399dbdb9c8ef030ab642b10820db8f56"];
  const results = await pairContract.getPairDataBalancer(poolAddrs);
  console.log(results);
}

async function endlessLoop() {
  while(true) {
    await new Promise((res, rej) => {
      setTimeout(() => {
        res('foo');
        console.log("foo")
      }, 2000)
    });
  }
}

process.on('SIGINT', function() {
  console.log("Caught interrupt signal");

  //if (i_should_exit)
      process.exit();
});
//testGetOptimalProfit();
//testGetOptimalProfitUnordered();
//testNegativeProfit();
//testTradeResultsInZero();
//testUpdateReservesDirectFromUniswap();
//endlessLoop();
//testUpdateReservesUni3();
//testUpdateReservesBalancer();
testGetPairDataBalancer();