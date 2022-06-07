pragma solidity >=0.5.0; 

interface IWeightedPool2Tokens {
      function getPoolId() external view returns (bytes32);   
      function getNormalizedWeights()
        external
        view
        returns (uint256[] memory normalizedWeights); 
      function getSwapFeePercentage() external view returns(uint256);
}
