//SPDX-License-Identifier: Unlicense
pragma experimental ABIEncoderV2;
pragma solidity >= 0.6.12;
//pragma solidiy = 0.7.5;
import "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import "./IUniswapV2Pair.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Router02.sol";
import '@uniswap/v3-core/contracts/interfaces/IUniswapV3Pool.sol';
import './ISwapRouter.sol';
import "./FullMath.sol";
//import "./Path.sol";
import "./IVault.sol";
import "./IWeightedPool2Tokens.sol";
import "./IAsset.sol";
import "./TransferHelper.sol";
import "./IWETH.sol";
import "./Ownable.sol";

contract ArbContractGoerli is FlashLoanReceiverBase, Ownable {
    //using SafeERC20 for IERC20;
    //using Path for bytes;
    address WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    //address UNISWAPV3_ROUTER2 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
    address SUSHIV2_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address SUSHIV2_FACTORY = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
    //address USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    //address UNISWAP_V2_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    address UNISWAP_V2_ROUTER = 0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D;
    address SWAP_ROUTER_UNI_V3 = 0xE592427A0AEce92De3Edee1F18E0157C05861564;
    address BALANCER_VAULT = 0xBA12222222228d8Ba445958a75a0704d566BF2C8;
    address[] _path;
    int256 _gainLoss;
    address[][] _paths;
    string[] _exchanges;
    uint256[][] _fees;
    address[][] _poolAddresses;
    uint256 _percentToCoinbase;
    //address _owner;
    //ExchangeToTradePath[] _exchangeToTradePath;
    mapping(string => address[])[] _exchangeToTradePath;

    struct Reserves{
        uint112 reserve0;
        uint112 reserve1;
        address poolAddress;
    }

    struct ExchangeToTradePath {
        string exchange;
        address[] _path;
    }

    receive() external payable {

    }

    constructor(ILendingPoolAddressesProvider provider) public FlashLoanReceiverBase(provider) {
//        _owner = owner;
    }

    //TODO: add onlyOwner modifier
    function callLendingPool(address[] memory assets, uint256[] memory amounts, ExchangeToTradePath[] memory exchangeToTradePath, address[][] memory paths, string[] memory exchanges, uint256[][] memory fees, address[][] memory poolAddresses, uint256 percentToCoinbase) public onlyOwner {
        _paths = paths;
        _exchanges = exchanges;
        _fees = fees;
        _poolAddresses = poolAddresses;
       _percentToCoinbase = percentToCoinbase;
        uint256[] memory modes = new uint256[](1);
        modes[0] = 0;
        LENDING_POOL.flashLoan(address(this), assets, amounts, modes, address(this), "0x", 0);
    }


    function executeOperation(
        address[] memory assets,
        uint256[] memory amounts,
        uint256[] memory premiums,
        address initiator,
        bytes memory params
    ) public override returns (bool) {
        for (uint256 i = 0; i < assets.length; i++) {
            //check the contract has the specified balance
            require(
                amounts[i] <= IERC20(assets[i]).balanceOf(address(this)),
                'Invalid balance for the contract'
            );
            uint256 amountToReturn = amounts[i] + premiums[i];
            //, nftVault, nftContract, tokenId, nftType
            //console.log("nftVault: %s", this.nftVault);

            /*if(_testNFT20 == true) {
                executeTradeNFT20Test(amounts[i], assets[i], _nftVault, _nftContract, _tokenId, _nftType);
            } else {
                executeTradeNFTXTest(amounts[i], assets[i], _nftVault, _nftContract, _tokenId, _nftType);
            }*/
            
            //swapExactTokensForTokensUniswap(amounts[i], 0, _path, address(this));
            swapExactTokensForTokens(amounts[i]);
            //buyNFT20SellNFTX(amounts[i], assets[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountToReturn);
            //console.log("coinbase: %s", block.coinbase);     
            uint256 toCoinbase = 0;
            uint256 toKeep = 0;
            if(assets[i] != WETH) {
                address[] memory path = new address[](2);
                path[0] = assets[i];
                path[1] = WETH;
                swapTokensForWeth(IERC20(assets[i]).balanceOf(address(this)) - amountToReturn, path);
                toCoinbase = ((IERC20(WETH).balanceOf(address(this))) * _percentToCoinbase) / 10000;
                toKeep = IERC20(WETH).balanceOf(address(this)) - toCoinbase;
            } else {
                toCoinbase = ((IERC20(WETH).balanceOf(address(this)) - amountToReturn) * _percentToCoinbase) / 10000;
                toKeep = IERC20(WETH).balanceOf(address(this)) - toCoinbase - amountToReturn;
            }
            IWETH(WETH).withdraw(toCoinbase + toKeep);
            block.coinbase.transfer(toCoinbase);
            payable(owner()).call{value: toKeep}("");
            return true;
        }
    }

    function getGainLoss() view public returns(int256) {
        return _gainLoss;
    }

    function getContractBalance() public onlyOwner returns(uint256) {
        return 10;//IERC20(WETH).balanceOf(address(this));
    }

    /*function buyNFT20SellNFTX(uint256 amount, address borrowedAsset) public {
        address[] memory path = new address[](2);
        path[0] = borrowedAsset;//WETH
        path[1] = _vaultNFT20;
        swapExactTokensForTokensUniswap(amount, 0, path, address(this));
        uint256[] memory specificIds = new uint256[](1);
        specificIds[0] = _tokenId;
        uint256[] memory nftAmount = new uint256[](1);
        nftAmount[0] = 1;
        redeemNFT20(specificIds, nftAmount, _vaultNFT20, _nftContract, _nftType);
        depositNFTX(specificIds, nftAmount, _vaultNFTX, _nftContract, _nftType);
        address[] memory path2 = new address[](2);
        path2[0] = _vaultNFTX;
        path2[1] = borrowedAsset;
        uint256 amountNFTXVault = IERC20(_vaultNFTX).balanceOf(address(this));
        swapExactTokensForTokensSushi(amountNFTXVault, 0, path2, address(this), block.timestamp + 365 * 24 * 60 * 60);

    }*/

    function payMiner() external payable{
        bool val = true;
        for(uint256 i = 0; i < 1000; i++) {//do work
            val = true;
        }
        block.coinbase.transfer(msg.value);
    }

    function swapExactTokensForTokensUniswap(uint256 amountIn, uint256 amountOutMin, address[] memory path, address to) internal {
        //console.log("total supply of BAYC20", IERC20(BAYC20).totalSupply());
        uint256 pathLen = path.length;
        uint256 balanceIn = uint256(IERC20(path[0]).balanceOf(address(this)));
        //IERC20(path[0]).approve(UNISWAP_V2_ROUTER, amountIn);
        TransferHelper.safeApprove(path[0], UNISWAP_V2_ROUTER, amountIn);

        IUniswapV2Router02(UNISWAP_V2_ROUTER).swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp + 60);
        //UNISWAP_V2_ROUTER.call(abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address,uint256)", amountIn, amountOutMin, path, address(this), block.timestamp + 600));
        uint256 balanceOut = uint256(IERC20(path[pathLen - 1]).balanceOf(address(this)));
    }

    function swapExactTokensForTokens(uint256 borrowedAmount) internal {
        uint256 balance = borrowedAmount;
        uint256 balanceStart = uint256(IERC20(_paths[0][0]).balanceOf(address(this)));
        for(uint256 i = 0; i < _exchanges.length; i++) {
            if(keccak256(bytes(_exchanges[i])) == keccak256(bytes("uni"))) {
                swapExactTokensForTokensUniswap(balance, 0, _paths[i], address(this));
            } else if(keccak256(bytes(_exchanges[i])) == keccak256(bytes("sushi"))) {
                swapExactTokensForTokensSushi(balance, 0, _paths[i], address(this), block.timestamp + 60);
            } else if(keccak256(bytes(_exchanges[i])) == keccak256(bytes("uni_v3"))) {
                swapTokensUniswapV3(balance, _paths[i], _fees[i]);
            } else {
                bytes32[] memory poolIds = new bytes32[](_poolAddresses[i].length);
                for(uint256 j = 0; j < _poolAddresses[i].length; j++) {
                    poolIds[j] = IWeightedPool2Tokens(_poolAddresses[i][j]).getPoolId();
                }
                swapTokensBalancer(balance, _paths[i], poolIds);
            }
            uint256 pathsILen = _paths[i].length;
            balance = IERC20(_paths[i][pathsILen - 1]).balanceOf(address(this));
        }
        uint256 balanceEnd = uint256(IERC20(_paths[_paths.length - 1][_paths[_paths.length - 1].length - 1]).balanceOf(address(this)));
        _gainLoss = int256(balanceEnd) - int256(balanceStart);
    }

    function swapExactTokensForTokensSushi(uint amountIn, uint amountOutMin, address[] memory path, address to, uint deadline) internal {
        //IERC20(path[0]).approve(COOL_WETH_PAIR_SUSHI, amountIn);
        TransferHelper.safeApprove(path[0], SUSHIV2_ROUTER, amountIn);
        //IERC20(path[0]).safeApprove(SUSHIV2_ROUTER, amountIn);
        //IERC20(path[0]).approve(SUSHIV2_FACTORY, amountIn);
        uint256 pathLen = path.length;
        uint256 balanceIn = uint256(IERC20(path[0]).balanceOf(address(this)));
        //console.log("allowance for COOL_WETH_PAIR: %s", IERC20(path[0]).allowance(address(this), COOL_WETH_PAIR_SUSHI));
        //console.log("amountIn: %s", amountIn);
        //(bool success, bytes memory data) = SUSHIV2_ROUTER.call(abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address,uint256)", amountIn, amountOutMin, path, address(this), deadline));
        IUniswapV2Router02(SUSHIV2_ROUTER).swapExactTokensForTokens(amountIn, amountOutMin, path, address(this), block.timestamp + 60);
        //console.log("swapExactTokensForTokens success: %s, data: %s", success, string(data));
        uint256 balanceOut = uint256(IERC20(path[pathLen - 1]).balanceOf(address(this)));
        //console.log("balance for path %s: is %s at address %s", path[1], balance, address(this));
        //console.log("balance / 10**18: %s", balance / 10**18);
    }

    function swapTokensUniswapV3(uint256 amountIn, address[] memory path, uint256[] memory fees) internal {
        //IERC20(path[0]).approve(SWAP_ROUTER_UNI_V3, amountIn);
        //(bool success, bytes memory data) = path[0].call(abi.encodeWithSelector(IERC20.approve.selector, SWAP_ROUTER_UNI_V3, amountIn));
        TransferHelper.safeApprove(path[0], SWAP_ROUTER_UNI_V3, amountIn);
        //console.log(success);
        uint256 balanceIn = uint256(IERC20(path[0]).balanceOf(address(this)));
        uint256 pathLen = path.length;
        bytes memory output;
        for(uint256 i = 0; i < fees.length; i++) {
            //console.log(path[i]);
            //console.log(fees[i]);
            output = abi.encodePacked(output, path[i]);
            output = abi.encodePacked(output, uint24(fees[i]));
        }
        output = abi.encodePacked(output, path[path.length - 1]);
        //console.log(path[path.length - 1]);
        //bytes memory firstPool = output.getFirstPool();
        //(address token1, address token2, uint24 fee) = output.decodeFirstPool();
        //bytes memory secondPool = firstPool.getFirstPool();
        //output = output.skipToken();//.skipToken();
        //(address token3, address token4, uint24 fee2) = output.decodeFirstPool();
        // console.log("decoded token1: %s", token1);
        // console.log("decoded token2: %s", token2);
        // console.log("decoded fee: %s", fee);
        // console.log("decoded token3: %s", token3);
        // console.log("decoded token4: %s", token4);
        // console.log("decoded fee2: %s", fee2);
        //console.log(output);
        /*console.log("path[0]: %s", path[0]);
        console.log("fees[0]: %s", fees[0]);
        output = abi.encodePacked(path[0]);
        console.log("encodePacked Called");
        address addr1 = abi.decode(output, (address));*/
        //console.log("decoded values:");
        //console.log(addr1);
        //console.log(fee1);
        ISwapRouter.ExactInputParams memory params = 
        ISwapRouter.ExactInputParams({
                path: output,
                recipient: address(this),
                deadline: block.timestamp,
                amountIn: amountIn,
                amountOutMinimum: 0
            });
        ISwapRouter(SWAP_ROUTER_UNI_V3).exactInput(params);
        uint256 balanceOut = uint256(IERC20(path[pathLen - 1]).balanceOf(address(this)));
    }

    function swapTokensForWeth(uint256 amountIn, address[] memory path) internal {
        TransferHelper.safeApprove(path[0], UNISWAP_V2_ROUTER, amountIn);
        IUniswapV2Router02(UNISWAP_V2_ROUTER).swapExactTokensForTokens(amountIn, 0, path, address(this), block.timestamp + 60);
    }

    function swapTokensBalancer(uint256 amountIn, address[] memory path, bytes32[] memory poolIds) internal {
    }

    function getReserves(address poolAddress) view public returns (uint112, uint112, uint32)  {
        //(bool success, bytes memory data) = poolAddress.call(abi.encodeWithSignature("getReserves()"));
        //(uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) = abi.decode(data, (uint112, uint112, uint32));
        (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) = IUniswapV2Pair(poolAddress).getReserves();
        return (_reserve0, _reserve1, _blockTimestampLast);
    }

    function getReserves2(address[] memory calls) view public returns (Reserves[] memory) {
        Reserves[] memory results = new Reserves[](calls.length);
        for(uint256 i = 0; i < calls.length; i++) {
            //console.log(calls[i]);
            //(bool success, bytes memory ret) = calls[i].call(abi.encodeWithSignature("getReserves()"));//calls[i].target.call(calls[i].callData);
            //(uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) = abi.decode(ret, (uint112,uint112,uint32));
            (uint112 _reserve0, uint112 _reserve1, uint32 _blockTimestampLast) = IUniswapV2Pair(calls[i]).getReserves();
            //console.log("_reserve0: %s", _reserve0);
            Reserves memory reserves = Reserves(_reserve0, _reserve1, calls[i]);
            results[i] = reserves;
            //bytes memory res = abi.encodePacked(_reserve0,_reserve1,_blockTimestampLast);
            //results[i] = (_reserve0, _reserve1, _blockTimestampLast);
            //results[i] = res;
        }
        return results;
    }

    function getReservesUni3(address[] memory poolAddrs) view public returns (Reserves[] memory) {
        Reserves[] memory results = new Reserves[](poolAddrs.length);
            for(uint256 i = 0; i < poolAddrs.length; i++) {
                uint128 liquidity = IUniswapV3Pool(poolAddrs[i]).liquidity();
                (uint160 sqrtPrice,,,,,,) = IUniswapV3Pool(poolAddrs[i]).slot0();
                uint256 reserve0 = (uint256(liquidity) << 96) / sqrtPrice;
                uint256 reserve1 = FullMath.mulDiv(uint256(liquidity), sqrtPrice, 2 ** (96));
                Reserves memory reserves = Reserves(uint112(reserve0), uint112(reserve1), poolAddrs[i]);
                results[i] = reserves;
            }
        return results;
    }

    function getReservesBalancer(address[] memory poolAddrs) view public returns(Reserves[] memory) {
        Reserves[] memory results = new Reserves[](poolAddrs.length);
        
        for(uint256 i = 0; i < poolAddrs.length; i++) {
            bytes32 poolId = IWeightedPool2Tokens(poolAddrs[i]).getPoolId();
            (IERC20[] memory tokens, uint256[] memory balances, uint256 lastChangeBlock) = IVault(BALANCER_VAULT).getPoolTokens(poolId);
            uint256[] memory normalizedWeights = IWeightedPool2Tokens(poolAddrs[i]).getNormalizedWeights();
            uint256 reserve0Normalized = (balances[0] * 1000000000000000000)/normalizedWeights[0];
            uint256 reserve1Normalized = (balances[1] * 1000000000000000000)/normalizedWeights[1];
            Reserves memory reserves = Reserves(uint112(reserve0Normalized), uint112(reserve1Normalized), poolAddrs[i]);
            results[i] = reserves;
        }
        return results;
    }
}