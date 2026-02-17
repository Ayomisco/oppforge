// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/access/Ownable.sol";

contract OppForgeMission is Ownable {
    struct Mission {
        bytes32 missionId;
        address hunter;
        string status; // "Started", "Submitted", "Completed", "Disputed"
        uint256 reward;
        uint256 timestamp;
    }

    mapping(bytes32 => Mission) public missions;
    mapping(address => uint256) public hunterReputation;
    mapping(address => uint256) public hunterEarnings;

    event MissionStarted(bytes32 indexed missionId, address indexed hunter);
    event MissionCompleted(bytes32 indexed missionId, address indexed hunter, uint256 reward);
    event ReputationUpdated(address indexed hunter, uint256 newReputation);

    constructor() Ownable(msg.sender) {}

    function startMission(bytes32 _missionId) external {
        require(missions[_missionId].hunter == address(0), "Mission already taken");
        
        missions[_missionId] = Mission({
            missionId: _missionId,
            hunter: msg.sender,
            status: "Started",
            reward: 0,
            timestamp: block.timestamp
        });

        emit MissionStarted(_missionId, msg.sender);
    }

    function completeMission(bytes32 _missionId, uint256 _reward, uint256 _repBonus) external onlyOwner {
        Mission storage m = missions[_missionId];
        require(m.hunter != address(0), "Mission not found");
        require(keccak256(abi.encodePacked(m.status)) != keccak256(abi.encodePacked("Completed")), "Already completed");

        m.status = "Completed";
        m.reward = _reward;
        
        hunterEarnings[m.hunter] += _reward;
        hunterReputation[m.hunter] += _repBonus;

        emit MissionCompleted(_missionId, m.hunter, _reward);
        emit ReputationUpdated(m.hunter, hunterReputation[m.hunter]);
    }

    function getHunterStats(address _hunter) external view returns (uint256 reputation, uint256 earnings) {
        return (hunterReputation[_hunter], hunterEarnings[_hunter]);
    }
}
