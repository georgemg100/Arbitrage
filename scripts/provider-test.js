const { ethers } = require("hardhat");
const { FlashbotsBundleProvider } = require("@flashbots/ethers-provider-bundle");
const { Wallet, Contract } = require("ethers");
const { builtinModules } = require("module");
//const provider = ethers.getDefaultProvider("mainnet");
//const provider = new ethers.providers.AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY)
const provider = new ethers.providers.StaticJsonRpcProvider("http://54.211.110.131:8545")
provider.pollingInterval = 500
async function main() {
    provider.on('block', async (blocknum) => {
        var d = new Date();
        console.log("received: " + d)
        console.log(blocknum);
    })
    //var res = await provider.getBlock("latest")
    //console.log(res);
}

main()