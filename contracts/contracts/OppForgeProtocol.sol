// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OppForgeProtocol is Ownable, ReentrancyGuard {
    
    enum Tier { SCOUT, HUNTER, FOUNDER }
    
    struct UserProfile {
        Tier tier;
        uint256 subscriptionExpiry;
        bool isLifetime;
    }

    mapping(address => UserProfile) public userProtocols;
    mapping( Tier => uint256) public tierPrices;
    
    event TierUpgraded(address indexed user, Tier newTier, uint256 expiry);
    event RewardDistributed(address indexed hunter, uint256 amount, bytes32 missionId);

    constructor() Ownable(msg.sender) {
        tierPrices[Tier.HUNTER] = 0.05 ether;  // ~ $150
        tierPrices[Tier.FOUNDER] = 0.2 ether;  // ~ $600 (Lifetime Access)
    }

    // 1. Monetization: Subscription / Tier Management
    function upgradeTier(Tier _tier) external payable nonReentrant {
        require(msg.value >= tierPrices[_tier], "Insufficient payment for protocol upgrade");
        
        if (_tier == Tier.FOUNDER) {
            userProtocols[msg.sender] = UserProfile({
                tier: _tier,
                subscriptionExpiry: 0,
                isLifetime: true
            });
        } else {
            userProtocols[msg.sender] = UserProfile({
                tier: _tier,
                subscriptionExpiry: block.timestamp + 30 days,
                isLifetime: false
            });
        }

        emit TierUpgraded(msg.sender, _tier, userProtocols[msg.sender].subscriptionExpiry);
    }

    // 2. Rewards & Funding: Integrated Reward Pool
    // This allows project owners or the platform to fund a mission
    mapping(bytes32 => uint256) public missionVaults;

    function fundMission(bytes32 _missionId) external payable {
        require(msg.value > 0, "Funding must be > 0");
        missionVaults[_missionId] += msg.value;
    }

    function releaseReward(bytes32 _missionId, address payable _hunter) external onlyOwner {
        uint256 amount = missionVaults[_missionId];
        require(amount > 0, "No funds in vault");
        
        missionVaults[_missionId] = 0;
        _hunter.transfer(amount);
        
        emit RewardDistributed(_hunter, amount, _missionId);
    }

    function withdrawTreasury() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }

    function setTierPrice(Tier _tier, uint256 _price) external onlyOwner {
        tierPrices[_tier] = _price;
    }
}
