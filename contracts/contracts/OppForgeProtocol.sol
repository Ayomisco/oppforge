// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract OppForgeProtocol is Ownable, ReentrancyGuard {
    enum Tier {
        SCOUT,
        HUNTER
    }

    struct UserProfile {
        Tier tier;
        uint256 subscriptionExpiry;
        bool isLifetime;
    }

    mapping(address => UserProfile) public userProtocols;
    mapping(Tier => uint256) public tierPrices;

    event TierUpgraded(address indexed user, Tier newTier, uint256 expiry);
    event RewardDistributed(
        address indexed hunter,
        uint256 amount,
        bytes32 missionId
    );

    constructor() Ownable(msg.sender) {
        tierPrices[Tier.HUNTER] = 0.005 ether; // ~ $10/month
    }

    // 1. Monetization: Subscription / Tier Management
    function upgradeTier(Tier _tier) external payable nonReentrant {
        require(_tier == Tier.HUNTER, "Only HUNTER tier is paid");
        require(
            msg.value >= tierPrices[_tier],
            "Insufficient payment for protocol upgrade"
        );

        userProtocols[msg.sender] = UserProfile({
            tier: _tier,
            subscriptionExpiry: block.timestamp + 30 days,
            isLifetime: false
        });

        emit TierUpgraded(
            msg.sender,
            _tier,
            userProtocols[msg.sender].subscriptionExpiry
        );
    }

    // 2. Rewards & Funding: Integrated Reward Pool
    // This allows project owners or the platform to fund a mission
    mapping(bytes32 => uint256) public missionVaults;

    event MissionFunded(
        bytes32 indexed missionId,
        address indexed funder,
        uint256 amount
    );

    function fundMission(bytes32 _missionId) external payable {
        require(
            msg.value >= 0.0001 ether,
            "Minimum funding: 0.0001 ETH (~$0.25)"
        );
        missionVaults[_missionId] += msg.value;
        emit MissionFunded(_missionId, msg.sender, msg.value);
    }

    function getMissionFunding(
        bytes32 _missionId
    ) external view returns (uint256) {
        return missionVaults[_missionId];
    }

    function releaseReward(
        bytes32 _missionId,
        address payable _hunter
    ) external onlyOwner nonReentrant {
        require(_hunter != address(0), "Invalid hunter address");
        uint256 amount = missionVaults[_missionId];
        require(amount > 0, "No funds in vault");

        missionVaults[_missionId] = 0;

        (bool success, ) = _hunter.call{value: amount}("");
        require(success, "Reward transfer failed");

        emit RewardDistributed(_hunter, amount, _missionId);
    }

    function withdrawTreasury() external onlyOwner nonReentrant {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");

        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    function setTierPrice(Tier _tier, uint256 _price) external onlyOwner {
        require(_tier == Tier.HUNTER, "Only HUNTER price is configurable");
        tierPrices[_tier] = _price;
    }
}
