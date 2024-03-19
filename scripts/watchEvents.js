const hre = require("hardhat");
const provider = new ethers.providers.AlchemyProvider("mainnet", process.env.ALCHEMY_API_KEY)

abi = [
    "event Transfer(address indexed src, address indexed dst, uint wad)"
  ];
  
let contract = new hre.ethers.Contract("0x6B175474E89094C44Da98b954EedeAC495271d0F", abi, provider);
contract.on("Transfer", (to, amount, from) => {
    console.log(to, amount, from);
});