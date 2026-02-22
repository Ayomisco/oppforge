// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title OppForgePayment
 * @dev Secure on-chain payment processor for OppForge clearance levels.
 * Emits events that the backend indexers can verify.
 */
contract OppForgePayment {
    address public owner;
    
    enum Tier { SCOUT, HUNTER, FOUNDER }
    
    event ClearanceUpgraded(
        address indexed pilot,
        Tier tier,
        uint256 amount,
        string emailHash
    );

    constructor() {
        owner = msg.sender;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only the forge master can call this.");
        _;
    }

    /**
     * @dev Pay for a clearance level upgrade.
     * @param tier The clearance level being purchased.
     * @param emailHash A hash of the user's email for backend mapping (privacy preserving).
     */
    function upgradeClearance(Tier tier, string memory emailHash) external payable {
        // Validation logic can be added here (e.g., minimum prices)
        // For Hunter ($2.9/mo) and Founder ($6/mo)
        
        emit ClearanceUpgraded(msg.sender, tier, msg.value, emailHash);
    }

    /**
     * @dev Withdraw funds from the forge to the owner.
     */
    function withdraw() external onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    receive() external payable {
        // Allow pure donations to the forge
    }
}
