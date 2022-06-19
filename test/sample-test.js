const { expect } = require("chai");
const { getCreate2Address } = require("ethers/lib/utils");
const { ethers } = require("hardhat");
const AAVE_PROVIDER  = "0xB53C1a33016B2DC2fF3653530bfF1848a515c8c5";
const ARB_CONTRACT_NAME = "ArbContract";
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
    const arbContract = await ArbContract.deploy(AAVE_PROVIDER);
    await arbContract.deployed()
  });
})
