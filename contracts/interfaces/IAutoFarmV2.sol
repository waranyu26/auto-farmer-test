// SPDX-License-Identifier: MIT

pragma solidity 0.6.12;

interface IAutoFarmV2 {
    // Want tokens moved from user -> AUTOFarm (AUTO allocation) -> Strat (compounding)
    function deposit(uint256 _pid, uint256 _wantAmt) external;

    // Withdraw LP tokens from MasterChef.
    function withdraw(uint256 _pid, uint256 _wantAmt) external;
}