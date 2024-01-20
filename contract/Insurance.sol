// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "hardhat/console.sol";

struct Insurance {
    uint32 insuranceType;      // car/travel/life insurance
    string data;               // string, for example number plates of car
    uint expirityDate;         // 
    address receiver;          // who receive insurance after insurance case
    address creator;           //
    uint256 maxCoverageAmount; // 
    uint16 status;             // 0 - 
    uint payedAmount;          // 
}