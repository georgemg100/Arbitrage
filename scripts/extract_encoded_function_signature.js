const { Web3 } = require('web3');
const fs = require('fs');

// Initialize web3 instance; you can also use a provider URL if needed
const web3 = new Web3();

// Load your contract's ABI
const abi = JSON.parse(fs.readFileSync('/Users/michael/solidity/arbitrage/artifacts/contracts/ArbContract.sol/ArbContract.json', 'utf8'));

// Create a contract instance
const myContract = new web3.eth.Contract(abi.abi);

// Extract function signatures
const functionSignatures = myContract.options.jsonInterface
    .filter(item => item.type === 'function')
    .map(func => {
        return func.name + ": " + web3.eth.abi.encodeFunctionSignature({
            name: func.name,
            type: 'function',
            inputs: func.inputs
        });
    });

console.log(functionSignatures);