const dependencies = require("./dependencies.js")
const InputDataDecoder = require('ethereum-input-data-decoder');
var UniSwapV2Router02 = require('./UniswapV2Router02.json')
const decoder = new InputDataDecoder(UniSwapV2Router02);
let { ChainId, Token, WETH, Fetcher, Pair }  = require('@uniswap/sdk')

async function pollGeth(executeTransaction) {
    const filterId = await dependencies.provider.send("eth_newPendingTransactionFilter", []);
    async function poll() {
        const hashes = await dependencies.provider.send("eth_getFilterChanges", [filterId])
        hashes.forEach(async (hash) => {
            const tx = await dependencies.provider.getTransaction(hash)
            executeTransaction(tx)
        });
    }
    setInterval(poll, 100)
}

async function main() {
    pollGeth(async (tx) => {
        //console.log(tx)
        if(tx && tx.data) {
            const decodedData = decoder.decodeData(tx.data);
            const path = decodedData.inputs[1]
            if(decodedData.method && decodedData.method.includes("swapExactETHForTokens") && path.length === 2) {
                console.log(path);
                const frontRunData = await calculateFrontRunData(decodedData, tx);
                sendSandwichAttack(frontRunData)
            }

        }
    })
}

main()

async function calculateFrontRunData(decodedData, tx) {
    const path = decodedData.inputs[1]
    const pairData = await fetchPairData(path[0], path[1], 18, 18)
    var reserves = pairData[0]
    const pairAddress = pairData[1]
    const gasPrice = await dependencies.provider.getGasPrice()
    const gasLimit = ( BigInt(tx.gasLimit._hex) * ( BigInt(115)))/( BigInt(100))
    const gasLimitApprove =  BigInt('203962')
    console.log("Price token1/token2 " + reserves.reserve0 / reserves.reserve1);
    const reserve0BN =  BigInt(reserves.reserve0.toString())
    const reserve1BN =  BigInt(reserves.reserve1.toString())
    const amountInVictim =  BigInt(tx.value._hex)
    const amountOutMin =  BigInt(decodedData.inputs[0])
   //const amountInAttacker =  BigInt(tenDollarsWorthEther)//getAmountInAttacker(reserve0BN, reserve1BN, amountInVictim, amountOutMin);
    var maxAmountInAttacker = getAmountInAttacker(reserve0BN, reserve1BN, amountInVictim, amountOutMin);
     if(maxAmountInAttacker > ( BigInt('1000000000000000000'))) {
          console.log('maxAmountInAttacker capped')
          maxAmountInAttacker =  BigInt('1000000000000000000')
     }
    
    const amountOutAttacker = (reserve1BN*(maxAmountInAttacker)*( BigInt(997)))/((reserve0BN*( BigInt(1000)))+(maxAmountInAttacker*( BigInt(997))))
    const amountOutAttackerAndVictimNumerator = (reserve1BN-(amountOutAttacker))*(amountInVictim)*( BigInt(997))
    const amountOutAttackerAndVictimDenominator = ((reserve0BN+(maxAmountInAttacker))*( BigInt(1000)))+(amountInVictim*( BigInt(997)))
    const amountOutAttackerAndVictim = amountOutAttackerAndVictimNumerator/(amountOutAttackerAndVictimDenominator)
    const amountSoldAttackerNumerator = (reserve0BN+(maxAmountInAttacker)+(amountInVictim))*(amountOutAttacker)*( BigInt(997))
    const amountSoldAttackerDenominator = ((reserve1BN-(amountOutMin)-(amountOutAttacker))*( BigInt(1000)))+(amountOutAttacker*( BigInt(997)))
    const amountSoldAttacker = amountSoldAttackerNumerator/(amountSoldAttackerDenominator)
    const profitWithoutGas = amountSoldAttacker-(maxAmountInAttacker);
    const gasToFrontRun = ( BigInt(tx.gasPrice._hex)*( BigInt('104')))/( BigInt('100'))
    const gasToFrontRunTotal = gasToFrontRun*(gasLimit)
    const gasToBackRun = ( BigInt(tx.gasPrice._hex)*( BigInt('98')))/( BigInt('100'))
    const gasToBackRunTotal = gasToBackRun*(gasLimit)
    const gasForApprovalTotal =  BigInt(gasPrice.toString())*(gasLimitApprove)
    const profitWithGas = profitWithoutGas-(gasToFrontRunTotal)-(gasToBackRunTotal)-(gasForApprovalTotal)
    const amountOutVictim = reserve1BN*(amountInVictim)*( BigInt(997))/(reserve0BN*( BigInt(1000))+(amountInVictim*( BigInt(997))));
    const amountOutMinAttacker = (amountOutAttacker*( BigInt(99)))/( BigInt(100))
    const slippagePercent = (amountOutVictim-(amountOutMin))*( BigInt(100))/(amountOutVictim)
    const deadline = Date.now() + 600000
    const isFrontRunnable = profitWithGas > ( BigInt(0)) && path.length == 2 && gasToFrontRun > ( BigInt(gasPrice.toString())) && maxAmountInAttacker >( BigInt(0))
    return {transactionHash: tx.hash, pairAddress: pairAddress, profitWithGas: profitWithGas.toString(), gasLimit: gasLimit.toString(), path: path, maxAmountInAttacker: maxAmountInAttacker.toString(), gasToFrontRun: gasToFrontRun.toString(), gasToBackRun: gasToBackRun.toString(), isFrontRunnable: isFrontRunnable, token: path[1], gasLimitApprove: gasLimitApprove.toString(), amountOutAttacker: amountOutAttacker.toString(), gasToBackRun: gasToBackRun.toString(), amountOutMinAttacker: amountOutMinAttacker.toString()}
}

var fetchPairData = (tokenAddress0, tokenAddress1, decimalsToken1, decimalsToken2) => {
	const token1 = new Token(ChainId.MAINNET, tokenAddress0, decimalsToken1);
	const token2 = new Token(ChainId.MAINNET, tokenAddress1, decimalsToken2);
	const pairAddress = Pair.getAddress(token1, token2)
	//console.log('pairAddress: ' + pairAddress)
	return new Promise((resolve, reject) => {
		Fetcher.fetchPairData(token1, token2, dependencies.provider).then(res => {
			if(token1.sortsBefore(token2)) {
				var reserves = {reserve0: res.reserve0.numerator, reserve1: res.reserve1.numerator}
				resolve([reserves, pairAddress])
			} else {
				var reserves = {reserve0: res.reserve1.numerator, reserve1: res.reserve0.numerator}
				resolve([reserves, pairAddress])
			}
			console.log(reserves)
//			console.log("Price token1/token2 " + token1Reserve / token2Reserve);
		}) 
	})

    
}

function getAmountInAttacker(reserve0BN, reserve1BN, amountInVictim, amountOutMin) {
    const amountInAttackerFirstTerm = (BigInt('-1997000')*(reserve0BN)-(BigInt('994009')*(amountInVictim)))/(BigInt('1994000'))
    const amountInAttackerSecondTerm = ((BigInt('994009')*(BigInt(Math.pow(Number(amountInVictim), 2))))/(BigInt('4000000')))-((BigInt(3)*(amountInVictim)*(reserve0BN))/(BigInt(2000)))+((reserve1BN*(amountInVictim)*(reserve0BN))/(amountOutMin))+((BigInt(9)*BigInt(Math.pow(Number(reserve0BN),2)))/(BigInt('3976036')))
    const amountInAttackerSecondTermSqrt = sqrt1(BigInt(amountInAttackerSecondTerm.toString()))
    return amountInAttackerFirstTerm+(BigInt(amountInAttackerSecondTermSqrt.toString()))
}

function sqrt1(value) {
    if (value < 0n) {
        throw 'square root of negative numbers is not supported'
    }

    if (value < 2n) {
        return value;
    }

    function newtonIteration(n, x0) {
        const x1 = ((n / x0) + x0) >> 1n;
        if (x0 === x1 || x0 === (x1 - 1n)) {
            return x0;
        }
        return newtonIteration(n, x1);
    }

    return newtonIteration(value, 1n);
}

function sendSandwichAttack(frontRunData) {
    new Promise((resolve, reject) => {
        const deadline = Date.now() + 600000
        sendTransaction('swapExactETHForTokens', frontRunData.maxAmountInAttacker, frontRunData.gasToFrontRun, frontRunData.gasLimit, frontRunData.amountOutMinAttacker, frontRunData.path, myAddress, deadline, latestNonce).then((tx) => {
            var tradeData = {txHash: tx.hash, contractMethod: 'swapExactETHForTokens', amountIn: frontRunData.maxAmountInAttacker.toString(), gasPrice: gasPrice.toString(), gasLimit: gasLimit.toString(), amountOutMin: amountOutMin.toString(), path: path, to: myAddress, deadline: deadline }
            console.log(tradeData)
            //writeToFile(tradesFilePath, tradeData)
            resolve(tx)
        }).catch(console.log)
    }).then((tx) => {
        console.log('swapExactEthForToken transaction: ')
        console.log(tx)
        pathReversed = [path[1], path[0]]
        //sendTransaction('swapExactTokensForETH', frontRunData.amountOutAttacker, frontRunData.gasToBackRun, frontRunData.gasLimit, new BN(0).toString(), pathReversed, myAddress, Date.now() + 600000, ++latestNonce, ++latestNonce, gasLimitApprove.toString())
    })
}

async function sendTransaction(contractMethodName,  amountIn, gasPrice, gasLimit, amountOutMin, path, to, deadline, nonce, nonce2, gasLimitApprove) {
    var contract = new ethers.Contract(uniswapV2RouterAddress, UniSwapV2Router02, wallet);
    var options = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: nonce, value: amountIn, from: "0x862e0E500147172523D01bBe2cF28F4f33192C72" };
    if(contractMethodName === 'swapExactETHForTokens') {
        //return contract[contractMethodName](amountOutMin, path, to, deadline, options)
    } else if(contractMethodName === 'swapExactTokensForETH') {
        //setTimeout(() => {
            /*var options = { gasLimit: gasLimitApprove, gasPrice: gasPrice, nonce: nonce, from: "862e0E500147172523D01bBe2cF28F4f33192C72" };
            const contractToken = new ethers.Contract(path[0], erc20abi, wallet);
            contractToken.approve(uniswapV2RouterAddress, amountIn, options).then((res) => {
                var optionsSwapTokens = { gasLimit: gasLimit, gasPrice: gasPrice, nonce: nonce2, from: "862e0E500147172523D01bBe2cF28F4f33192C72" };
                contract[contractMethodName](amountIn, amountOutMin, path, to, deadline, optionsSwapTokens).then((tx) =>{
                    var tradeData = {txHash: tx.hash, contractMethod: contractMethodName, amountIn: amountIn, gasPrice: gasPrice, gasLimit: gasLimit, amountOutMin: amountOutMin, path: path, to: to, deadline: deadline }
                    console.log(tradeData)
                    //writeToFile(tradesFilePath, tradeData)
            })
            }).catch(console.log)*/
            //}, 500)
        
    }
    const baseFeeNextBlock = await getBaseFeeNextBlock(targetBlock)//await timeFunctionCall(getBaseFeeNextBlock, [targetBlock])
    flashbotsProvider.getBaseFeeInNextBlock(baseFee)
    //var d2 = new Date();
    //const end = d2.getTime()
    //console.log("getBaseFee execution time: " +(end - start))
    //const gasEstimate = feeData.gasPrice * 
    //const gasEstimate = arbContract.estimateGas.
    const signedTransactions = await flashbotsProvider.signBundle([
        {
            signer: dependencies.wallet,
            transaction: {
            to: arbContract.address,
            gasPrice: BigInt(Math.ceil(Number(BigInt(baseFeeNextBlock._hex)) * 1.127)),//BigInt(Math.floor(Number(baseFee) * 1.125)/* + BigInt(feeData.maxPriorityFeePerGas._hex)*/),
            gasLimit: 1700000,
            data: callData,
            chainId: CHAIN_ID,
            value: 0,
            },
        }
    ]);
    return null
}

async function getBaseFeeNextBlock() {
    const block = await dependencies.provider.getBlock(targetBlock - 1);
    const baseFee = BigInt(block.baseFeePerGas._hex);
    //const gasUsed = block.gasUsed;
    //const gasLimit = block.gasLimit;
    const baseFeeNextBlock = dependencies.getBaseFeeInNextBlock(block.baseFeePerGas, block.gasUsed, block.gasLimit);
    //getBaseFeeInNextBlock(currentBaseFeePerGas: BigNumber, currentGasUsed: BigNumber, currentGasLimit: BigNumber): BigNumber;
    console.log("block base fee: " + baseFee);
    console.log(BigInt(baseFeeNextBlock._hex));
    return baseFeeNextBlock;
}
