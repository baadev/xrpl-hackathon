// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "hardhat/console.sol";
import "contracts/Insurance.sol";

interface IInsuranceManager {
    function createInsurance(
        uint32 insuranceType,
        string memory data,
        uint256 expired,
        address claimer,
        uint256 maxCoverageAmount
    ) external payable;

    function makePayment(uint index, uint value) external;
    function approveInsurance(uint index) external;
    function rejectInsurance(uint index) external;
    function createNewType(string memory insuranceName) external;
}