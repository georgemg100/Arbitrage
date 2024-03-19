const { ethers } = require("hardhat");
//const provider = ethers.getDefaultProvider("goerli");

const AAVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const AAVE_PROVIDER_KOVAN = "0x88757f2f99175387ab4c6a4b3067c77a695b0349";
//console.log(process.env.PRIVATE_KEY)
//const wallet = ethers.Wallet(process.env.PRIVATE_KEY);
//console.log("Deploying contracts with the account:", deployer.address);


//console.log(wallet);
async function deployGoerli() {
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

async function deployKovan() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const ArbContract = await hre.ethers.getContractFactory("ArbContract");
    const arbContract = await ArbContract.deploy(AAVE_PROVIDER_KOVAN);
    //await arbContract.deployed();
    console.log(arbContract);
    console.log("ArbContract address:", arbContract.address);

    //const tx = await arbContract.deployed();
    //console.log(tx);
}

async function deployMainnet() {
    const [deployer] = await ethers.getSigners();
    console.log("Deploying contracts with the account:", deployer.address);
    console.log("Account balance:", (await deployer.getBalance()).toString());
    const ArbContract = await hre.ethers.getContractFactory("ArbContract");
    const arbContract = await ArbContract.deploy(AAVE_PROVIDER);
    //await arbContract.deployed();
    console.log(arbContract);
    console.log("ArbContract address:", arbContract.address);
}
//deployKovan();
deployGoerli();
//deployMainnet();