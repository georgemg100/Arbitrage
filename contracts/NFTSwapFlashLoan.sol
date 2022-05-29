//SPDX-License-Identifier: Unlicense
pragma solidity >= 0.6.12;

import "hardhat/console.sol";
import "@aave/protocol-v2/contracts/flashloan/base/FlashLoanReceiverBase.sol";
import "./IERC721Receiver.sol";
import "./IERC1155Receiver.sol";

/*interface IFlashLoanReceiver {
    function executeOperation(
        uint256[] calldata _ids,
        uint256[] calldata _amounts,
        address initiator,
        bytes calldata params
    ) external returns (bool);
}*/

contract NFTSwapFlashLoan is FlashLoanReceiverBase, IERC721Receiver, IERC1155Receiver {
    address WETH = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
    address UNISWAPV3_ROUTER2 = 0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45;
    address public constant DAI = 0x6B175474E89094C44Da98b954EedeAC495271d0F;
    address BAYC_UNISWAPV2PAIR = 0xA39CE99cC323472a27602017eEEc4f2ea828a737;
    address NFTX_COOL_CATS_VAULT = 0x114f1388fAB456c4bA31B1850b244Eedcd024136;
    address NFT20_COOL_CATS_VAULT = 0x2Dab4cE3490BB50b2EA4C07Ab1B6a9CfE29D89B3;
    address COOL_WETH_PAIR_SUSHI =  0x0225E940deEcC32A8d7C003CfB7dae22aF18460C;
    address COOL_CATS_NFT = 0x1A92f7381B9F03921564a437210bB9396471050C;
    address SUSHIV2_ROUTER = 0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F;
    address SUSHIV2_FACTORY = 0xC0AEe478e3658e2610c5F7A4A2E1777cE9e4f2Ac;
    address WETH_USDT_PAIR = 0x06da0fd433C1A5d7a4faa01111c044910A184553;
    address USDT = 0xdAC17F958D2ee523a2206206994597C13D831ec7;
    address GCG_NFT20_VAULT = 0xfdE43cd91F7F127dbbbc263394519669296396dB;
    address GCG_NFTX_VAULT = 0x0b3B9dCc99F64e6D66C88D053fAe44009b032b3e;
    address GCG_NFT_CONTRACT = 0xEdB61f74B0d09B2558F1eeb79B247c1F363Ae452;
    address INFTXVAULFACTORY = 0xBE86f647b167567525cCAAfcd6f881F1Ee558216;
    address NFTXVAULTFACTORYUPGRADABLE = 0x612447E8d0BDB922059cE048bb5a7CeF9e017812;
    address NFTX_FEE_DISTRIBUTOR = 0xFD8a76dC204e461dB5da4f38687AdC9CC5ae4a86;

    uint256 public balanceNFTX_COOL_CATS_VAULT;
    uint256 public balanceWETH;
    uint256 _tokenId;
    address _vaultNFT20;
    address _vaultNFTX;
    address _nftContract;
    uint256 _nftType;
    bool _testNFT20;

    

    constructor(ILendingPoolAddressesProvider provider) public FlashLoanReceiverBase(provider) {
    }

    function setData(uint256 tokenId, address vaultNFT20, address vaultNFTX, address nftContract, uint256 nftType, bool testNFT20) public {
        _tokenId = tokenId;
        _vaultNFT20 = vaultNFT20;
        _vaultNFTX = vaultNFTX;
        _nftContract = nftContract;
        _nftType = nftType;
        _testNFT20 = testNFT20;
    }

    //TODO: add onlyOwner modifier
    function callLendingPool(address[] memory assets, uint256[] memory amounts, uint256[] memory modes, bytes calldata params, uint16 referralCode) public {
        console.log("callLendingPool");
        LENDING_POOL.flashLoan(address(this), assets, amounts, modes, address(this), params, referralCode);
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
            console.log("amount WETH borrowed: %s", amounts[i]);
            require(
                amounts[i] <= IERC20(assets[i]).balanceOf(address(this)),
                'Invalid balance for the contract'
            );
            uint256 amountToReturn = amounts[i] + premiums[i];
            console.log("amountToReturn: %s", amountToReturn);
            //, nftVault, nftContract, tokenId, nftType
            //console.log("nftVault: %s", this.nftVault);

            /*if(_testNFT20 == true) {
                executeTradeNFT20Test(amounts[i], assets[i], _nftVault, _nftContract, _tokenId, _nftType);
            } else {
                executeTradeNFTXTest(amounts[i], assets[i], _nftVault, _nftContract, _tokenId, _nftType);
            }*/

            buyNFT20SellNFTX(amounts[i], assets[i]);
            IERC20(assets[i]).approve(address(LENDING_POOL), amountToReturn);
            console.log("WETH after swap: %s", IERC20(WETH).balanceOf(address(this)));
            return true;
        }
    }

    function getContractBalance() public returns(uint256) {
        console.log("remaining weth balance: %s", IERC20(WETH).balanceOf(address(this)));
        return IERC20(WETH).balanceOf(address(this));
    }

    function buyNFT20SellNFTX(uint256 amount, address borrowedAsset) public {
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

    }

    /*function executeTradeNFTXTest(uint256 amount, address asset, address vault, address nftContract, uint256 tokenId, uint256 nftType) public {
        address[] memory path = new address[](2);
        path[0] = asset;
        path[1] = vault;
        console.log("block timestamp %s: ", block.timestamp);
        swapExactTokensForTokensSushi(amount, 0, path, address(this), block.timestamp + 365 * 24 * 60 * 60);
        uint256 tokenId = tokenId;
        uint256[] memory specificIds = new uint256[](1);
        specificIds[0] = tokenId;
        uint256 balanceCool = IERC20(path[1]).balanceOf(address(this));
        redeemNFTX(1, specificIds, vault, nftContract, nftType);
        uint256[] memory nftAmount = new uint256[](1);
        nftAmount[0] = 1;
        depositNFTX(specificIds, nftAmount, vault, nftContract, nftType);
    }

    function executeTradeNFT20Test(uint256 amount, address asset, address vault, address nftContract, uint256 tokenId, uint256 nftType) public {
        address[] memory path = new address[](2);
            path[0] = asset;
            path[1] = vault;
            swapExactTokensForTokensUniswap(amount, 0, path, address(this));
            uint256[] memory specificIds = new uint256[](1);
            specificIds[0] = tokenId;
            uint256[] memory nftAmount = new uint256[](1);
            nftAmount[0] = 1;
            redeemNFT20(specificIds, nftAmount, vault, nftContract, nftType);
            depositNFT20(specificIds, vault, nftContract, nftType);
    }*/


    function swapExactTokensForTokensUniswap(uint256 amountIn, uint256 amountOutMin, address[] memory path, address to) public payable {
        console.log("swapExactTokensForTokens");
        //console.log("total supply of BAYC20", IERC20(BAYC20).totalSupply());
        IERC20(path[0]).approve(UNISWAPV3_ROUTER2, amountIn);
        UNISWAPV3_ROUTER2.call(abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address)", amountIn, amountOutMin, path, address(this)));
        uint256 balance = IERC20(path[1]).balanceOf(address(this));
        console.log("balance for path %s: is %s at address %s", path[1], balance, address(this));
        console.log("balance / 10**18: %s", balance / 10**18);
    }

    function getBalanceOfVaulToken(address tokenAddress) view public returns(uint256) {
        uint256 balance = IERC20(tokenAddress).balanceOf(address(this));
        console.log("balance for path %s: is %s at address %s", tokenAddress, balance, address(this));
        console.log("balance / 10**18: %s", balance / 10**18);
        return balance;
    }

    function getContractAddres() view  public returns(address) {
        return address(this);
    }

    function getOwnerOfNft(address nftContract, uint256 specificId) public returns(address) {
        (bool success, bytes memory data) = nftContract.call(abi.encodeWithSignature("ownerOf(uint256)", specificId));
        address owner = abi.decode(data, (address));
        return owner;
    }

    function swapExactTokensForTokensSushi(uint amountIn, uint amountOutMin, address[] memory path, address to, uint deadline) public payable {
        console.log("swapTokensForExactTokensSushi");
        //IERC20(path[0]).approve(COOL_WETH_PAIR_SUSHI, amountIn);
        IERC20(path[0]).approve(SUSHIV2_ROUTER, amountIn);
        IERC20(path[0]).approve(SUSHIV2_FACTORY, amountIn);
        //console.log("allowance for COOL_WETH_PAIR: %s", IERC20(path[0]).allowance(address(this), COOL_WETH_PAIR_SUSHI));
        console.log("amountIn: %s", amountIn);
        (bool success, bytes memory data) = SUSHIV2_ROUTER.call(abi.encodeWithSignature("swapExactTokensForTokens(uint256,uint256,address[],address,uint256)", amountIn, amountOutMin, path, address(this), deadline));
        console.log("swapExactTokensForTokens success: %s, data: %s", success, string(data));
        uint256 balance = IERC20(path[1]).balanceOf(address(this));
        console.log("balance for path %s: is %s at address %s", path[1], balance, address(this));
        console.log("balance / 10**18: %s", balance / 10**18);
    }

    function redeemNFTX(uint256 amount, uint256[] memory specificIds, address vault, address nftContract, uint256 nftType) public {
        (bool success1, bytes memory data1) = vault.call(abi.encodeWithSignature("redeem(uint256,uint256[])", amount, specificIds));
        console.log("redeem success %s, data: %s", success1, string(data1));
        //IERC721(COOL_CATS_NFT).balanceOf(address(this));
        //(bool success, bytes memory data) = COOL_CATS_NFT.call(abi.encodeWithSignature("balanceOf(address)", address(this)));
        if(nftType == 1155) {
            (bool success2, bytes memory data2) = nftContract.call(abi.encodeWithSignature("balanceOf(address,uint256)", address(this), specificIds[0]));
            uint256 balance = abi.decode(data2, (uint256));
            console.log("nft balance for %s is %s (after redeem)", address(this), balance);
        } else {
            (bool success, bytes memory data) = nftContract.call(abi.encodeWithSignature("ownerOf(uint256)", specificIds[0]));
            //console.log("nft call balnce of success: %s", success);
            //uint256 balance = abi.decode(data, (uint256));
            address owner = abi.decode(data, (address));
            //console.log("Cool cats nft balance: %s", balance);
            console.log("Cool cats nft owner: %s, address(this): %s", owner, address(this));
        }
        
            
    }

    function depositNFTX(uint256[] memory specificIds, uint256[] memory amount, address vault, address nftContract, uint256 nftType) internal {
        console.log("specificIds[0]: %s", specificIds[0]);
        if(nftType == 1155) {
                //function setApprovalForAll(address operator, bool approved) public virtual override {
            nftContract.call(abi.encodeWithSignature("setApprovalForAll(address,bool)", vault, true));
        } else {
            nftContract.call(abi.encodeWithSignature("approve(address,uint256)", vault, specificIds[0]));
        }
        (bool success1, bytes memory data1) = vault.call(abi.encodeWithSignature("mint(uint256[],uint256[])", specificIds, amount));
        console.log("deposit success %s, data: %s", success1, data1.length);
        if(nftType == 1155) {
            (bool success2, bytes memory data2) = nftContract.call(abi.encodeWithSignature("balanceOf(address,uint256)", address(this), specificIds[0]));
            (bool success3, bytes memory data3) = nftContract.call(abi.encodeWithSignature("balanceOf(address,uint256)", vault, specificIds[0]));
            uint256 balance = abi.decode(data2, (uint256));
            uint256 balanceVault = abi.decode(data3, (uint256));
            console.log("nft balance for %s is %s (after deposit)", address(this), balance);
            console.log("nft balance for %s is %s (after deposit)", vault, balanceVault);
        } else {
            (bool success, bytes memory data) = nftContract.call(abi.encodeWithSignature("ownerOf(uint256)", specificIds[0]));
            address owner = abi.decode(data, (address));
            console.log("owner after adding nft back to vault: %s", owner);
        }
        
        uint256 balance = IERC20(vault).balanceOf(address(this));
        console.log("amount GCG_VAULT_NFTX: %s", balance);
    }

    function redeemNFT20(uint256[] memory specificIds, uint256[] memory amounts, address vault, address nft, uint256 nftType) public {
        (bool success1, bytes memory data1) = vault.call(abi.encodeWithSignature("withdraw(uint256[],uint256[],address)", specificIds, amounts, address(this)));
        console.log("success: %s data1: %s", success1, string(data1));
        // (bool success3, bytes memory data3) = nft.call(abi.encodeWithSignature("nftType"));
        // uint256 nftType = abi.decode(data3, (uint256));
        console.log("nftType: %s", nftType);
        if(nftType == 1155) {
            (bool success2, bytes memory data2) = nft.call(abi.encodeWithSignature("balanceOf(address,uint256)", address(this), specificIds[0]));
            uint256 balance = abi.decode(data2, (uint256));
            console.log("nft balance for %s is %s (after redeem)", address(this), balance);
        } else {
            (bool success, bytes memory data) = nft.call(abi.encodeWithSignature("ownerOf(uint256)", specificIds[0]));
            address owner = abi.decode(data, (address));
            console.log("nft owner: %s, address(this): %s", owner, address(this));
        }
        //console.log("nft call balnce of success: %s", success);
        //uint256 balance = abi.decode(data, (uint256));
        
        //console.log("Cool cats nft balance: %s", balance);
    }

    function depositNFT20(uint256[] memory specificIds, address vault, address nft, uint256 nftType) public {
        //function multi721Deposit(uint256[] memory _ids, address _referral) public {
        if(nftType == 1155) {
            /*
            function safeTransferFrom(
                address from,
                address to,
                uint256 id,
                uint256 amount,
                bytes memory data
            ) public virtual override {
            */

            //nft.call(abi.encodeWithSignature("setApprovalForAll(address,bool)", vault, true));
            nft.call(abi.encodeWithSignature("safeTransferFrom(address,address,uint256,uint256,bytes)", address(this), vault, specificIds[0], 1, ""));
        } else {
            nft.call(abi.encodeWithSignature("approve(address,uint256)", vault, specificIds[0]));
            vault.call(abi.encodeWithSignature("multi721Deposit(uint256[],address)", specificIds, address(0x0)));
        }
        
        if(nftType == 1155) {
            (bool success2, bytes memory data2) = nft.call(abi.encodeWithSignature("balanceOf(address,uint256)", address(this), specificIds[0]));
            (bool success3, bytes memory data3) = nft.call(abi.encodeWithSignature("balanceOf(address,uint256)", vault, specificIds[0]));
            uint256 balance = abi.decode(data2, (uint256));
            uint256 balanceVault = abi.decode(data3, (uint256));
            console.log("nft balance for %s is %s (after deposit)", address(this), balance);
            console.log("nft balance for %s is %s (after deposit)", vault, balanceVault);
        } else {
            (bool success, bytes memory data) = nft.call(abi.encodeWithSignature("ownerOf(uint256)", specificIds[0]));
            address owner = abi.decode(data, (address));
            console.log("owner after adding nft back to vault: %s", owner);
        }
        uint256 balance = IERC20(vault).balanceOf(address(this));
        console.log("amount NFT20_COOLCATS_VAULT: %s", balance);
    }
    
    //From SUSHIV2Router
    function pairFor(address factory, address tokenA, address tokenB) internal pure returns (address pair) {
        (address token0, address token1) = (tokenB,tokenA);
        pair = address(uint(keccak256(abi.encodePacked(
                hex'ff',
                factory,
                keccak256(abi.encodePacked(token0, token1)),
                hex'e18a34eb0e04b04f7a0ac29a6e80748dca96319b42c54d679cb821dca90c6303' // init code hash
            ))));
    }

function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC721Receiver.onERC721Received.selector;
    }

    function onERC1155Received(
        address operator,
        address from,
        uint256 id,
        uint256 value,
        bytes calldata data) external override returns(bytes4) {
        return IERC1155Receiver.onERC1155Received.selector;
    }

    function onERC1155BatchReceived(
        address operator,
        address from,
        uint256[] calldata ids,
        uint256[] calldata values,
        bytes calldata data
    ) external override returns (bytes4) {
        return IERC1155Receiver.onERC1155BatchReceived.selector;
    }

    function supportsInterface(bytes4 interfaceId) external override view returns (bool)  {
        return true;
    }

    /*function nft20FlashLoan(uint256[] memory tokenIds, uint256[] memory amounts, address _operator, bytes params, uint256 nftType) public {
        /*
            function flashLoan(
            uint256[] calldata _ids,
            uint256[] calldata _amounts,
            address _operator,
            bytes calldata _params
            ) external flashloansEnabled() {
        */
        
    /*    _vaultNFT20.call(abi.encodeWithSignature("flashLoan(uint256[],uint256[],address,bytes", tokenIds, amounts, _operator, params));
        if(nftType == 1155) {
            (bool success2, bytes memory data2) = nft.call(abi.encodeWithSignature("balanceOf(address,uint256)", address(this), specificIds[0]));
            (bool success3, bytes memory data3) = nft.call(abi.encodeWithSignature("balanceOf(address,uint256)", vault, specificIds[0]));
            uint256 balance = abi.decode(data2, (uint256));
            uint256 balanceVault = abi.decode(data3, (uint256));
            console.log("nft balance for %s is %s (after deposit)", address(this), balance);
            console.log("nft balance for %s is %s (after deposit)", vault, balanceVault);
        } else {
            (bool success, bytes memory data) = nft.call(abi.encodeWithSignature("ownerOf(uint256)", specificIds[0]));
            address owner = abi.decode(data, (address));
            console.log("owner after adding nft back to vault: %s", owner);
        }
        uint256 balance = IERC20(_vaultNFT20).balanceOf(address(this));
        console.log("amount NFT20_COOLCATS_VAULT: %s", balance);
    }

    function executeOperation(
        uint256[] calldata _ids,
        uint256[] calldata _amounts,
        address initiator,
        bytes calldata params
    ) external override returns (bool) {
        console.log("token id borrowed: %s", _ids[0]);
        
        return true;
    }*/


}