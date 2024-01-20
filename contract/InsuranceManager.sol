// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts@v4.9.3/access/Ownable.sol";
import "hardhat/console.sol";
import "contracts/Insurance.sol";

contract InsuranceManager is Ownable {

    // Properties

    address[] private verifiedAdresses;
    uint256 private lockedValue = 0;

    mapping(uint => Insurance) private insurances;
    uint private insuranceCount;

    mapping(uint32 => string) private insuranceTypes;
    uint32 typeCount;

    // Events

    event Received(address, uint);       // sender, amount
    event CreateNewInsurance(uint);      // insurance id
    event CreateNewType(uint32, string); // insurance id, name
    event InsuranceRejected(uint);       // insurance id
    event InsuranceApproved(uint);       // insurance id
    event Payed(uint, uint);             // insurance id, amount

    // Lifecycle

    constructor(address[] memory addresses) {
        console.log("Smart contract deployed");
        for (uint i = 0; i < addresses.length; i++) {
            verifiedAdresses.push(addresses[i]);
        }
        insuranceTypes[0] = "Car Insurance";
        insuranceTypes[1] = "Life Insurance";
        insuranceTypes[2] = "Travel Insurance";
        insuranceTypes[3] = "Contract Insurance";
        typeCount = 4;
    }

    receive() external payable {
        emit Received(msg.sender, msg.value);
    }

    fallback() external payable {
        emit Received(msg.sender, msg.value);
    }

    // Public methods

    function createInsurance(
        uint32 insuranceType,
        string memory data,
        uint expirityDate,
        address receiver,
        uint256 maxCoverageAmount
    ) external payable {
        require(
            insuranceType < typeCount,
            "wrong insuranceType"
        );
        require(
            expirityDate > block.timestamp,
            "wrong expired timestamp"
        );
        insurances[insuranceCount] = Insurance(
            insuranceType,
            data,
            expirityDate,
            receiver,
            msg.sender,
            maxCoverageAmount,
            0,
            msg.value
        );
        emit CreateNewInsurance(insuranceCount);
        insuranceCount++;
    }

    // Verified accounts methods

    // Bullshit
    function makePayment(uint index, uint value) external payable {
        require(
            isVerified(msg.sender),
            "Access denied. Only for verified accounts"
        );
        Insurance storage insurance = insurances[index];
        if (insurance.maxCoverageAmount - insurance.payedAmount >= value) {
            insurance.payedAmount += value;
            lockedValue -= value;
            (bool sent, ) = insurance.receiver.call{value: value}("insurance payment");
            require(sent, "Failed to send Ether");
            emit Payed(index, value);
        } else {
            uint payValue = insurance.maxCoverageAmount - insurance.payedAmount;
            insurance.payedAmount += payValue;
            lockedValue -= payValue;
            insurance.status = 2;
            (bool sent, ) = insurance.receiver.call{value: payValue}("insurance payment");
            require(sent, "Failed to send Ether");
            emit Payed(index, payValue);
        }
    }

    function approveInsurance(uint index) external {
        require(
            isVerified(msg.sender),
            "Access denied. Only for verified accounts"
        );
        Insurance storage insurance = insurances[index];
        lockedValue += insurance.maxCoverageAmount;
        require(
            address(this).balance - lockedValue > insurance.maxCoverageAmount,
            "Not enough available balance"
        );
        insurance.status = 1;
        emit InsuranceApproved(index);
    }

    function rejectInsurance(uint index) external {
        require(
            isVerified(msg.sender),
            "Access denied. Only for verified accounts"
        );
        Insurance storage insurance = insurances[index];
        insurance.status = 4;
        emit InsuranceRejected(index);
    }

    // Owner's methods

    function createNewType(string memory insuranceName) external onlyOwner {
        insuranceTypes[typeCount] = insuranceName;
        emit CreateNewType(typeCount, insuranceName);
        typeCount++;
    }

    function changeVerifiedAccounts(address[] memory addresses) external onlyOwner {
        verifiedAdresses = addresses;
    }

    // Private methods

    function isVerified(address checkingAddress) internal view returns (bool) {
        for (uint i = 0; i < verifiedAdresses.length; i++) {
            if (verifiedAdresses[i] == checkingAddress) {
                return true;
            }
        }
        return false;
    }

    // Getters

    // Get Insurances

    function getInsurance(uint index) external view returns (Insurance memory) {
        return insurances[index]; // not correct status if expired
    }

    function getInsurancesCount() external view returns (uint) {
        return insuranceCount;
    }

    // Get types
    function getType(uint32 index) external view returns (string memory) {
        return insuranceTypes[index];
    }

    function getTypesCount() external view returns (uint32) {
        return typeCount;
    }

    // Get Balances
    function getLockedBalance() external view returns (uint256) {
        return lockedValue; // 0,000000001
    }
 
    function getAvailableBalance() external view returns (uint256) {
        return address(this).balance - lockedValue;
    }

    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }

    // Another gets
    function getVerifiedAdresses() external view returns (address[] memory) {
        return verifiedAdresses;
    }

    function getStatus(uint index) external view returns (uint16) {
        if (insurances[index].expirityDate > block.timestamp) {
            return 3;
        }
        return insurances[index].status;
    }
} 