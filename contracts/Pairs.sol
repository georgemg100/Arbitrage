pragma experimental ABIEncoderV2;
pragma solidity >= 0.6.12;
import "hardhat/console.sol";
import "./IUniswapV2Factory.sol";
import "./IUniswapV2Pair.sol";
import "./IERC20.sol";

contract Pairs {

    address UNISWAP_V2_FACTORY = 0x5C69bEe701ef814a2B6a3EDD4B1652CB9cc5aA6f;
    struct PairData{
        address _token0;
        address _token1;
        uint8 _token0_decimal;
        uint8 _token1_decimal;
        string _token0_symbol;
        string _token1_symbol;
        uint112 _reserve0;
        uint112 _reserve1;
        address _poolAddress;
    }

    function getPairDataUniswap(address[] memory pairAddresses) view public returns(PairData[] memory) {
        PairData[] memory result = new PairData[](pairAddresses.length);
        //console.log("allPairsLength: %s", allPairsLength);
        for(uint256 i = 0; i < pairAddresses.length; i++) {
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairAddresses[i]).getReserves();
            address  token0 = IUniswapV2Pair(pairAddresses[i]).token0();
            address  token1 = IUniswapV2Pair(pairAddresses[i]).token1();
            console.log(token0);
            console.log(token1);
            string memory token0_symbol = IERC20(token0).symbol();
            string memory token1_symbol = IERC20(token1).symbol();
            console.log(token0_symbol);
            console.log(token1_symbol);
            uint8 token0_decimal = IERC20(token0).decimals();
            uint8 token1_decimal = IERC20(token1).decimals();
            /*console.log("pairAddr: %s", pairAddr); 
            console.log("reserve0: %s", reserve0);
            console.log("reserve1: %s", reserve1); 
            console.log("token0: %s", token0);
            console.log("token1: %s", token1);
            console.log("token0_symbol: %s", token0_symbol); 
            console.log("token1_symbol: %s", token1_symbol);
            console.log("token0_decimal: %s", token0_decimal);
            console.log("token1_decimal: %s", token1_decimal);
            console.log("");*/
            PairData memory pairData = PairData(token0, token1, token0_decimal, token1_decimal, token0_symbol, token1_symbol, reserve0, reserve1, pairAddresses[i]);
            //PairData2 memory pairData2 = PairData2(token0, token1, reserve0, reserve1, pairAddresses[i]);

            //PairData memory pairData = PairData(address(this), address(this), 4, 4, "usdc", "usdc", 10, 10, address(this));
            result[i] = pairData;
        }
        //return new PairData[](end - start + 1);
        return result;
    }

    function getPairDataSushiswap(address[] memory pairAddresses) view public returns(PairData[] memory) {
        PairData[] memory result = new PairData[](pairAddresses.length);
        //console.log("allPairsLength: %s", allPairsLength);
        for(uint256 i = 0; i < pairAddresses.length; i++) {
            (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairAddresses[i]).getReserves();
            address  token0 = IUniswapV2Pair(pairAddresses[i]).token0();
            address  token1 = IUniswapV2Pair(pairAddresses[i]).token1();
            console.log(token0);
            console.log(token1);
            string memory token0_symbol = IERC20(token0).symbol();
            string memory token1_symbol = IERC20(token1).symbol();
            console.log(token0_symbol);
            console.log(token1_symbol);
            uint8 token0_decimal = IERC20(token0).decimals();
            uint8 token1_decimal = IERC20(token1).decimals();
            /*console.log("pairAddr: %s", pairAddr); 
            console.log("reserve0: %s", reserve0);
            console.log("reserve1: %s", reserve1); 
            console.log("token0: %s", token0);
            console.log("token1: %s", token1);
            console.log("token0_symbol: %s", token0_symbol); 
            console.log("token1_symbol: %s", token1_symbol);
            console.log("token0_decimal: %s", token0_decimal);
            console.log("token1_decimal: %s", token1_decimal);
            console.log("");*/
            PairData memory pairData = PairData(token0, token1, token0_decimal, token1_decimal, token0_symbol, token1_symbol, reserve0, reserve1, pairAddresses[i]);
            //PairData2 memory pairData2 = PairData2(token0, token1, reserve0, reserve1, pairAddresses[i]);

            //PairData memory pairData = PairData(address(this), address(this), 4, 4, "usdc", "usdc", 10, 10, address(this));
            result[i] = pairData;
        }
        //return new PairData[](end - start + 1);
        return result;
    }

    function getAllPairDataUniswap(uint256 idx) view public returns(PairData[] memory) {
        PairData[] memory result = new PairData[](1);
        address pairAddress = IUniswapV2Factory(UNISWAP_V2_FACTORY).allPairs(idx);
        //console.log("allPairsLength: %s", allPairsLength);
        (uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairAddress).getReserves();
        address  token0 = IUniswapV2Pair(pairAddress).token0();
        address  token1 = IUniswapV2Pair(pairAddress).token1();
        //console.log(token0);
        //console.log(token1);
        string memory token0_symbol = IERC20(token0).symbol();
        string memory token1_symbol = IERC20(token1).symbol();
        //console.log(token0_symbol);
        //console.log(token1_symbol);
        uint8 token0_decimal = IERC20(token0).decimals();
        uint8 token1_decimal = IERC20(token1).decimals();
        /*console.log("pairAddr: %s", pairAddr); 
        console.log("reserve0: %s", reserve0);
        console.log("reserve1: %s", reserve1); 
        console.log("token0: %s", token0);
        console.log("token1: %s", token1);
        console.log("token0_symbol: %s", token0_symbol); 
        console.log("token1_symbol: %s", token1_symbol);
        console.log("token0_decimal: %s", token0_decimal);
        console.log("token1_decimal: %s", token1_decimal);
        console.log("");*/
        PairData memory pairData = PairData(token0, token1, token0_decimal, token1_decimal, token0_symbol, token1_symbol, reserve0, reserve1, pairAddress);
        //PairData2 memory pairData2 = PairData2(token0, token1, reserve0, reserve1, pairAddresses[i]);

        //PairData memory pairData = PairData(address(this), address(this), 4, 4, "usdc", "usdc", 10, 10, address(this));
        result[0] = pairData;
        
        //return new PairData[](end - start + 1);
        return result;
    }

    function allPairsLength() view public returns(uint256) {
        return IUniswapV2Factory(UNISWAP_V2_FACTORY).allPairsLength();
    }

    function getAllPairDataUniswap2() view public returns(PairData[] memory) {
        uint256 allPairsSize = allPairsLength();
        allPairsSize = 100;
        PairData[] memory result = new PairData[](allPairsSize);
        for(uint256 i = 0; i < allPairsSize; i++) {
            address _pairAddress = address(this);
            uint112 _reserve0 = 0;
            uint112 _reserve1 = 0;
            address _token0 = address(this);
            address _token1 = address(this);
            string memory _token0_symbol = "default";
            string memory _token1_symbol = "default";
            uint8 _token0_decimal = 0;
            uint8 _token1_decimal = 0;
            try IUniswapV2Factory(UNISWAP_V2_FACTORY).allPairs(i) returns(address pairAddress){
                console.log(pairAddress);
                _pairAddress = pairAddress;
            } catch(bytes memory) {
                continue;
            }
            //address pairAddress = IUniswapV2Factory(UNISWAP_V2_FACTORY).allPairs(i);
            //(bool success, bytes memory ret) = UNISWAP_V2_FACTORY.call(abi.encodeWithSignature("allPairs(uint256)", i));
            try IUniswapV2Pair(_pairAddress).getReserves() returns (uint112 reserve0, uint112 reserve1,uint32 blockTimestampLast) {
                //(uint112 reserve0, uint112 reserve1,) = IUniswapV2Pair(pairAddress).getReserves();
                _reserve0 = reserve0;
                _reserve1 = reserve1;
                console.log("reserve0: %s:", reserve0);
            } catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            try IUniswapV2Pair(_pairAddress).token0() returns(address token0){
                _token0 = token0;
                console.log("token0: %s:", token0);
            }catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            try IUniswapV2Pair(_pairAddress).token1() returns(address token1){
                _token1 = token1;
                console.log("token1: %s:", token1);
            }catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            try IERC20(_token0).symbol() returns(string memory token0_symbol){
                _token0_symbol = token0_symbol;
                console.log("token0_symbol: %s:", token0_symbol);
            }catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            try IERC20(_token1).symbol() returns(string memory token1_symbol){
                _token1_symbol = token1_symbol;
                console.log("token1_symbol: %s:", token1_symbol);
            }catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            try IERC20(_token0).decimals() returns(uint8 token0_decimal){
                _token0_decimal = token0_decimal;
                console.log("token0_decimal: %s:", token0_decimal);
            }catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            try IERC20(_token1).decimals() returns(uint8 token1_decimal){
                _token1_decimal = token1_decimal;
                console.log("_token1_decimal: %s:", _token1_decimal);
            }catch Error(string memory _err) {
            } catch(bytes memory) {
            }
            //console.log(_token0_symbol);
            /*address token0 = IUniswapV2Pair(pairAddress).token0();
            address token1 = IUniswapV2Pair(pairAddress).token1();
            string memory token0_symbol = IERC20(token0).symbol();
            string memory token1_symbol = IERC20(token1).symbol();
            uint8 token0_decimal = IERC20(token0).decimals();
            uint8 token1_decimal = IERC20(token1).decimals();*/
            PairData memory pairData = PairData(_token0, _token1, _token0_decimal, _token1_decimal, _token0_symbol, _token1_symbol, _reserve0, _reserve1, _pairAddress);
            result[i] = pairData;
           
        }
        return result;
    }



}
