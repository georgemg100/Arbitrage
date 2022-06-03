const axios = require('axios');
const { builtinModules } = require('module');
const startCoins = require("../files/start_coins.json");
let response = null;
const prices = new Map();
const mapTokenAddrToSymbol = new Map();
startCoins.forEach((coin) => {
    mapTokenAddrToSymbol.set(coin.address, coin.symbol);
})


function getLatestPrice(tokenSymbols) {
    //var startCoinsQueryParams = "";
    //startCoinsQueryParams = "" + startCoins[0].symbol
   /*for(var i = 1; i < 1; i++) {
        startCoinsQueryParams += "," + startCoins[i].symbol;
    }*/
    //console.log(startCoinsQueryParams);
    //var response1 = 
    return new Promise(async (resolve, reject) => {
        try {
          response = await axios.get('https://pro-api.coinmarketcap.com/v2/cryptocurrency/quotes/latest?symbol=' + tokenSymbols[0] + "," + tokenSymbols[1] + "," + tokenSymbols[2], {
            headers: {
              'X-CMC_PRO_API_KEY': '751bf7df-9252-4cfa-8713-ba52a1f543d5',
            },
          });
        } catch(ex) {
          response = null;
          // error
          console.log(ex);
          prices.set(tokenSymbols[0], 1);
          prices.set(tokenSymbols[1], 1);
          prices.set(tokenSymbols[2], 1);
          resolve(undefined);
        }
        if (response) {
          // success
            jsonRes = response.data;
          console.log(JSON.stringify(jsonRes));
          //jsonRes.dat
          prices.set(tokenSymbols[0], jsonRes.data[tokenSymbols[0].toUpperCase()][0].quote.USD.price);
          prices.set(tokenSymbols[1], jsonRes.data[tokenSymbols[1].toUpperCase()][0].quote.USD.price);
          prices.set(tokenSymbols[2], jsonRes.data[tokenSymbols[2].toUpperCase()][0].quote.USD.price);
          resolve(jsonRes);
        }
      });
      //console.log(response1);
      //prices.set(tokenSymbols[0], response1.data[tokenSymbols[0].toUpperCase()][0].quote.USD.price);
      //prices.set(tokenSymbols[1], response1.data[tokenSymbols[1].toUpperCase()][0].quote.USD.price);
      //prices.set(tokenSymbols[2], response1.data[tokenSymbols[2].toUpperCase()][0].quote.USD.price);
      //return jsonRes;
}

async function getAllPrices() {
    var reqs = []
    for(var i = 0; i < startCoins.length; i+= 3) {
        var queryParams = [startCoins[i].symbol, startCoins[i + 1].symbol, startCoins[i + 2].symbol];
        reqs.push(getLatestPrice(queryParams))
    }
    await Promise.all(reqs).then((val) => {
        console.log(val)
    })
}

function getTokenPrice(tokenAddr) {
    return prices.get(mapTokenAddrToSymbol.get(tokenAddr));
}
var startCoinsQueryParams = ""
for(var i = 0; i < startCoins.length; i++) {
    startCoinsQueryParams += "," + startCoins[i].symbol;
}
console.log(startCoinsQueryParams);
getAllPrices().then(() => {
    console.log("getAllPrices finished");
});
module.exports.getTokenPrice = getTokenPrice
