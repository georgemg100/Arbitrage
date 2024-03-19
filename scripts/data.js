const UNIV3_SUBGRAPH_URL = "https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3"
const axios = require('axios')
var sqrt = require('bigint-isqrt');
const { TickMath } = require('@uniswap/v3-sdk');


// enum Direction {
//   ASC,
//   DESC,
// }

async function getReservesUniV3(poolId) {
  const [liquidity, currentTick, tickLower, tickUpper] = await getTickUpperAndLower(poolId)
  if(tickLower == 0 && tickUpper == 0) return [0,0]
  const sqrtPriceCurrent = getSqrtPrice(currentTick)
  const sqrtPriceLower = getSqrtPrice(tickLower)
  const sqrtPriceUpper = getSqrtPrice(tickUpper)
  const reserve0 = Number(liquidity) * ((sqrtPriceUpper - sqrtPriceCurrent)/(sqrtPriceCurrent*sqrtPriceUpper))
  const reserve1 = Number(liquidity) * (sqrtPriceCurrent - sqrtPriceLower)
  const reserve0DiffCalc = Math.pow(Number(liquidity) * (1/sqrtPriceCurrent), 2)
  const reserve1DiffCalc = Math.pow(Number(liquidity) * sqrtPriceCurrent, 2)

  console.log('sqrtPriceCurrent', sqrtPriceCurrent)
  console.log('tickLower', tickLower)
  console.log('tickUpper', tickUpper)
  console.log('reserve0', reserve0)
  console.log('reserve1', reserve1)
  console.log('reserve0DiffCalc', reserve0DiffCalc)
  console.log('reserve1DiffCalc', reserve1DiffCalc)
  console.log('price', reserve1/reserve0)
  console.log('priceDiffCalc', reserve1DiffCalc/reserve0DiffCalc)
  return [Math.floor(reserve0), Math.floor(reserve1), poolId]
}

function getSqrtPrice(tick) {
  return Math.sqrt(Math.pow(1.0001, Number(tick)))
}

function getSqrtPriceX96(tick) {
  const Q96 = BigInt(2) ** BigInt(96)//Math.pow(2, 96)
  const scaleFactor = BigInt(1e18)
  const sqrtPrice = Math.sqrt(Math.pow(1.0001, Number(tick)))
  const fixedPointSqrtPrice = BigInt(Math.floor(sqrtPrice * 1e18))
  console.log('fixedPointSqrtPrice', fixedPointSqrtPrice)
  return fixedPointSqrtPrice * Q96 / scaleFactor
}

function getSqrtPriceX96v3(tick) {
  console.log('tick', tick)
  const sqrtRatioAtTick = TickMath.getSqrtRatioAtTick(tick);
  return BigInt(String(sqrtRatioAtTick))
}

function getSqrtPriceX96v2(tick) {
  const absTick = BigInt(Math.abs(tick))
  var ratio = absTick % BigInt("0x1") != 0 ? BigInt("0xfffcb933bd6fad37aa2d162d1a594001") : BigInt("0x100000000000000000000000000000000")

  if ((absTick & BigInt("0x2")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xfff97272373d413259a46990580e213a")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x4")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xfff2e50f5f656932ef12357cf3c7fdcc")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x8")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xffe5caca7e10e4e61c3624eaa0941cd0")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x10")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xffcb9843d60f6159c9db58835c926644")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x20")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xff973b41fa98c081472e6896dfb254c0")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x40")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xff2ea16466c96a3843ec78b326b52861")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x80")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xfe5dee046a99a2a811c461f1969c3053")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x100")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xfcbe86c7900a88aedcffc83b479aa3a4")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x200")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xf987a7253ac413176f2b074cf7815e54")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x400")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xf3392b0822b70005940c7a398e4b70f3")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x800")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xe7159475a2c29b7443b29c7fa6e889d9")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x1000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xd097f3bdfd2022b8845ad8f792aa5825")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x2000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0xa9f746462d870fdf8a65dc1f90e061e5")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x4000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0x70d869a156d2a1b890bb3df62baf32f7")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x8000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0x31be135f97d08fd981231505542fcfa6")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x10000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0x9aa508b5b7a84e1c677de54f3e99bc9")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x20000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0x5d6af8dedb81196699c329225ee604")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x40000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0x2216e584f5fa1ea926041bedfe98")) >> BigInt(128);
  }
  if ((absTick & BigInt("0x80000")) !== BigInt(0)) {
    ratio = (ratio * BigInt("0x48a170391f7dc42444e8fa2")) >> BigInt(128);
  }
  if(tick > 0) {
    ratio = ((BigInt(2)**BigInt(256)) - BigInt(1)) / ratio;
  }
  return (ratio >> 32n) + (ratio % (BigInt(1) << 32n) == 0 ? 0n : 1n)
}

async function getTickUpperAndLower(poolId) {
    const CURRENT_ACT_LIIQUIDITY_QUERY = `{
        pool(id: "${poolId}") {
          liquidity
      }
    }`
    const CURRENT_TICK_QUERY = `{
           pools(where: {id: "${poolId}"}) {
             tick
           }
      }`
    const POOL_POSITIONS_QUERY = `{
      positions(where: {pool: "${poolId}"}) {
        id
        liquidity
        tickLower {
          tickIdx
        }
        tickUpper {
          tickIdx
        }
      }
    }`
    // const result = axios.post(UNIV3_SUBGRAPH_URL, {query: CURRENT_TICK_QUERY })
    // //console.log('result', JSON.stringify(result.data))
    // const result2 = axios.post(UNIV3_SUBGRAPH_URL, {query: POOL_POSITIONS_QUERY })
    const [result, result2, result3] = await Promise.all([
      axios.post(UNIV3_SUBGRAPH_URL, {query: CURRENT_TICK_QUERY }), 
      axios.post(UNIV3_SUBGRAPH_URL, {query: POOL_POSITIONS_QUERY }),
      axios.post(UNIV3_SUBGRAPH_URL, {query: CURRENT_ACT_LIIQUIDITY_QUERY})
    ])
    const currentTick = result.data.data.pools[0].tick

    console.log('currentTick', currentTick)
    const positions = result2.data.data.positions
    console.log('positions', positions)
    const activePositions = positions.filter(position => 
      position.tickLower.tickIdx <= currentTick && position.tickUpper.tickIdx >= currentTick);
    console.log('active positions', activePositions)
    if(activePositions.length == 0) return [0,0,0,0]
    const largestPosition = activePositions.reduce((max, position) => 
      max.liquidity > position.liquidity ? max : position, activePositions[0]);
    const tickLower = largestPosition.tickLower.tickIdx
    const tickUpper = largestPosition.tickUpper.tickIdx
    const liquidity = largestPosition.liquidity
    return [liquidity, currentTick, tickLower, tickUpper]

}

async function getReserves2UniV3(poolId) {
  const CURRENT_ACT_LIQUIDITY_QUERY = `{
    pool(id: "${poolId}") {
      liquidity
    }
  }`
  const CURRENT_TICK_QUERY = `{
    pools(where: {id: "${poolId}"}) {
      tick
    }
  }`
  const POOL_INITIALIZED_TICKS_QUERY = `{ ticks(
      where: {poolAddress: "${poolId}", liquidityNet_not: "0"}
      first: 1000,
      orderBy: tickIdx,
      orderDirection: asc
    ) {
      tickIdx
      liquidityGross
      liquidityNet
    }
  }`
  const [result1, result2, result3] = await Promise.all([
    axios.post(UNIV3_SUBGRAPH_URL, {query: CURRENT_TICK_QUERY }), 
    axios.post(UNIV3_SUBGRAPH_URL, {query: POOL_INITIALIZED_TICKS_QUERY }),
    axios.post(UNIV3_SUBGRAPH_URL, {query: CURRENT_ACT_LIQUIDITY_QUERY})
  ])
  const currentTick = parseInt(result1.data.data.pools[0].tick)
  const activeLiquidity = BigInt(result3.data.data.pool.liquidity)
  const initializedTicks = result2.data.data.ticks
  console.log('currentTick', currentTick)
  console.log('activeLiquidity', activeLiquidity)
  //console.log('initializedTicks[0].tickIdx', initializedTicks[0].tickIdx)
  console.log('initializedTicks.length', initializedTicks.length)

  for(var i = 0; i < initializedTicks.length; i++) {
    if(Number(initializedTicks[i].tickIdx) > currentTick) {
      if(!initializedTicks[i - 1]) {
        console.log('initializedTicks[i - 1]', initializedTicks[i - 1])
        return //[[0,0, poolId]]
      } 
      const tickLower = parseInt(initializedTicks[i - 1].tickIdx)
      const tickUpper = parseInt(initializedTicks[i].tickIdx)
      const Q96 = Math.pow(2, 96)
      console.log('tickLower', tickLower)
      console.log('tickUpper', tickUpper)
      const sqrtPriceCurrent = getSqrtPriceX96v3(currentTick)
      const sqrtPriceLower = getSqrtPriceX96v3(tickLower)
      const sqrtPriceUpper = getSqrtPriceX96v3(tickUpper)
      console.log('priceCurrent', (sqrtPriceCurrent * sqrtPriceCurrent) >> BigInt(192))
      console.log('priceCurrent2', 1/Math.pow(Number(sqrtPriceCurrent) / Math.pow(2, 96),2))
      console.log('sqrtPriceCurrent', sqrtPriceCurrent)
      console.log('sqrtPriceLower', sqrtPriceLower)
      console.log('sqrtPriceUpper', sqrtPriceUpper)
      //const reserve0 = ((BigInt(activeLiquidity) * BigInt(Q96) * (sqrtPriceUpper - sqrtPriceCurrent)) / sqrtPriceUpper)/sqrtPriceCurrent
      //const reserve1 = (BigInt(activeLiquidity) * (sqrtPriceCurrent - sqrtPriceLower))/BigInt(Q96)
      const [reserve0, reserve1] = calculateReserves(activeLiquidity, sqrtPriceUpper, sqrtPriceLower, sqrtPriceCurrent)
      console.log('reserve0', reserve0)
      console.log('reserve1', reserve1)
      console.log('liquiditySquaredCalcFromReserves', reserve0 * reserve1)
      console.log('activeLiquiditySqaured', activeLiquidity * activeLiquidity)
      console.log('price', reserve1 / reserve0)
      console.log('poolId', poolId)
      const reserve0DiffCalc = (((activeLiquidity * BigInt(1)) << BigInt(96)) / sqrtPriceCurrent)//Math.pow(Number(liquidity) * (1/sqrtPriceCurrent), 2)
      const reserve1DiffCalc = (activeLiquidity * sqrtPriceCurrent) >> BigInt(96)//Math.pow(Number(liquidity) * sqrtPriceCurrent, 2)
      const calcFromReservesPrice = reserve1DiffCalc / reserve0DiffCalc
      console.log('calcFromReservesPrice', calcFromReservesPrice)
      console.log('reserve0DiffCalc', reserve0DiffCalc)
      console.log('reserve1DiffCalc', reserve1DiffCalc)
      console.log('priceFromAV2Pool', (75375768464182/21714692468940038400598) * (Math.pow(10, 18)/Math.pow(10, 6)))
      console.log('priceFromAV2Pool', (21714692468940038400598/ 75375768464182) * (Math.pow(10, 6)/Math.pow(10, 18)))
      return [[reserve0DiffCalc, reserve1DiffCalc, poolId]]
    }
  }
}

function calculateReserves(activeLiquidity, sqrtPriceUpper, sqrtPriceLower, sqrtPriceCurrent) {
  const Q96 = Math.pow(2, 96)
  const reserve0 = ((activeLiquidity * BigInt(Q96) * (sqrtPriceUpper - sqrtPriceCurrent)) / sqrtPriceUpper)/sqrtPriceCurrent
  const reserve1 = (activeLiquidity * (sqrtPriceCurrent - sqrtPriceLower))/BigInt(Q96)
  return [reserve0, reserve1]
}

getReserves2UniV3("0x8ad599c3a0ff1de082011efddc58f1908eb6e6d8")

module.exports.getTickUpperAndLower = getTickUpperAndLower;
module.exports.getReservesUniV3 = getReservesUniV3
module.exports.getReserves2UniV3 = getReserves2UniV3