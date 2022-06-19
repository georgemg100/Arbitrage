const { ethers } = require("hardhat");
//const provider = ethers.getDefaultProvider("goerli");

const AAVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
//console.log(process.env.PRIVATE_KEY)
//const wallet = ethers.Wallet(process.env.PRIVATE_KEY);
//console.log("Deploying contracts with the account:", deployer.address);


//console.log(wallet);
async function main() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const ArbContract = await hre.ethers.getContractFactory("ArbContractGoerli");
    const arbContract = await ArbContract.deploy(AAVE_PROVIDER/*, {gasLimit: 3000000}*/);
    //await arbContract.deployed();
    console.log(arbContract);
    console.log("ArbContract address:", arbContract.address);

    //const tx = await arbContract.deployed();
    //console.log(tx);
}

main();