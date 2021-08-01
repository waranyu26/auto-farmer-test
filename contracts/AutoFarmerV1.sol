//SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "hardhat/console.sol";
import { SafeMath } from "@openzeppelin/contracts/math/SafeMath.sol";
import { SafeERC20 } from "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import { IERC20 } from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import { ReentrancyGuard } from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import { Ownable } from "@openzeppelin/contracts/access/Ownable.sol";

import { IStrategy } from './interfaces/IStrategy.sol';
import { IAutoFarmV2 } from './interfaces/IAutoFarmV2.sol';

contract AutoFarmerV1 is Ownable, ReentrancyGuard {
  using SafeMath for uint256;
  using SafeERC20 for IERC20;

  // Info of each user.
  struct UserInfo {
    uint256 shares; // How many LP tokens the user has provided.
    uint256 rewardDebt; // Reward debt. See explanation below.
  }

  // Info of each pool.
  struct PoolInfo {
    IERC20 farmToken; // Address of farm token contract.
    uint256 allocPoint; // How many allocation points assigned to this pool. AUTO to distribute per block.
    uint256 lastRewardBlock; // Last block number that AUTO distribution occurs.
    uint256 accAUTOPerShare; // Accumulated AUTO per share, times 1e12. See below.
    address strat; // Strategy address that will auto compound want tokens
  }

  PoolInfo[] public poolInfo; // Info of each pool.
  mapping(uint256 => mapping(address => UserInfo)) public userInfo; // Info of each user that stakes LP tokens.
  uint256 public totalAllocPoint = 1; // Total allocation points. Must be the sum of all allocation points in all pools.

  address public AutoFarmV2_CrossChain = 0x763a05bdb9f8946d8C3FA72d1e0d3f5E68647e5C;

  event Add(uint256 _allocPoint, IERC20 _farmToken, bool _withUpdate, address _strat);
  event Deposit(address indexed user, uint256 indexed pid, uint256 amount);
  event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);
  event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

  function poolLength() external view returns (uint256) { 
    return poolInfo.length;
  }

  // Add a new farming token to the pool. Can only be called by the owner.
  // XXX DO NOT add the same farming token more than once. Rewards will be messed up if you do. (Only if want tokens are stored here.)

  function add(uint256 _allocPoint, IERC20 _farmToken, bool _withUpdate, address _strat) public onlyOwner {
    totalAllocPoint = totalAllocPoint.add(_allocPoint);
    poolInfo.push(
      PoolInfo({
        farmToken: _farmToken,
        allocPoint: _allocPoint,
        lastRewardBlock: 0,
        accAUTOPerShare: 0,
        strat: _strat
      })
    );

    emit Add(_allocPoint, _farmToken, _withUpdate, _strat);
  }

  // View function to see staked Want tokens on frontend.
  function stakedWantTokens(uint256 _pid, address _user) external view returns (uint256) {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][_user];

    uint256 sharesTotal = IStrategy(pool.strat).sharesTotal();
    uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat).wantLockedTotal();
    if (sharesTotal == 0) {
      return 0;
    }
    return user.shares.mul(wantLockedTotal).div(sharesTotal);
  }

  function getSharesAdded(uint256 _wantAmt, address _strat) internal view returns (uint256) {
    uint256 wantLockedTotal = IStrategy(_strat).wantLockedTotal();
    uint256 sharesTotal = IStrategy(_strat).sharesTotal();
    uint256 entranceFeeFactor = IStrategy(_strat).entranceFeeFactor();
    uint256 entranceFeeFactorMax = IStrategy(_strat).entranceFeeFactorMax();

    uint256 sharesAdded = _wantAmt;
    if (wantLockedTotal > 0 && sharesTotal > 0) {
      sharesAdded = _wantAmt
        .mul(sharesTotal)
        .mul(entranceFeeFactor)
        .div(wantLockedTotal)
        .div(entranceFeeFactorMax);
    }
    return sharesAdded;
  }

  function getSharesRemoved(uint256 _wantAmt, address _strat) internal view returns (uint256) {
    uint256 wantLockedTotal = IStrategy(_strat).wantLockedTotal();
    uint256 sharesTotal = IStrategy(_strat).sharesTotal();

    uint256 sharesRemoved = _wantAmt.mul(sharesTotal).div(wantLockedTotal);
    if (sharesRemoved > sharesTotal) {
      sharesRemoved = sharesTotal;
    }
    return sharesRemoved;
  }

  // farm tokens moved from user -> AUTOFarm (AUTO allocation) -> Strat (compounding)
  function deposit(uint256 _pid, uint256 _wantAmt) public nonReentrant {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];

    if (_wantAmt > 0) {
      pool.farmToken.safeTransferFrom(
        address(msg.sender),
        address(this),
        _wantAmt
      );

      pool.farmToken.safeIncreaseAllowance(AutoFarmV2_CrossChain, _wantAmt);
      IAutoFarmV2(AutoFarmV2_CrossChain).deposit(_pid, _wantAmt);
      uint256 sharesAdded = getSharesAdded(_wantAmt, pool.strat);
      user.shares = user.shares.add(sharesAdded);
    }

    emit Deposit(msg.sender, _pid, _wantAmt);
  }

  // Withdraw farm tokens from contract.
  function withdraw(uint256 _pid, uint256 _wantAmt) public nonReentrant {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];

    uint256 wantLockedTotal = IStrategy(poolInfo[_pid].strat).wantLockedTotal();
    uint256 sharesTotal = IStrategy(poolInfo[_pid].strat).sharesTotal();

    require(user.shares > 0, "user shares is not enough");
    require(sharesTotal > 0, "shares total is not enough");

    // Withdraw farming tokens
    uint256 amount = user.shares.mul(wantLockedTotal).div(sharesTotal);
    if (_wantAmt > amount) {
      _wantAmt = amount;
    }
    if (_wantAmt > 0) {
      uint256 sharesRemoved = getSharesRemoved(_wantAmt, pool.strat);

      if (sharesRemoved > user.shares) {
        user.shares = 0;
      } else {
        user.shares = user.shares.sub(sharesRemoved);
      }

      uint256 wantBal = IERC20(pool.farmToken).balanceOf(address(this));
      if (wantBal < _wantAmt) {
        _wantAmt = wantBal;
      }
      pool.farmToken.safeTransfer(address(msg.sender), _wantAmt);
    }

    emit Withdraw(msg.sender, _pid, _wantAmt);
  }

  // Withdraw without caring about rewards. EMERGENCY ONLY.
  function emergencyWithdraw(uint256 _pid) public {
    PoolInfo storage pool = poolInfo[_pid];
    UserInfo storage user = userInfo[_pid][msg.sender];
    pool.farmToken.safeTransfer(address(msg.sender), user.shares);
    emit EmergencyWithdraw(msg.sender, _pid, user.shares);
    user.shares = 0;
  }
}
