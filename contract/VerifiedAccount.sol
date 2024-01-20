// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts@v4.9.3/access/Ownable.sol";
import "hardhat/console.sol";
import "contracts/IInsuranceManager.sol";

contract VerifiedAccount is Ownable {

    IInsuranceManager private insuranceManager;

    constructor(address _insuranceManager) {
        insuranceManager = IInsuranceManager(_insuranceManager);
    }

    function approve(uint index) external onlyOwner {
        insuranceManager.approveInsurance(index);
    }

    function reject(uint index) external onlyOwner {
        insuranceManager.rejectInsurance(index);
    }

    function pay(uint index, uint value) external onlyOwner {
        insuranceManager.makePayment(index, value);
    }
}