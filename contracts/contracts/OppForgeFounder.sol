// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OppForgeFounder is ERC721, Ownable {
    uint256 public nextTokenId;
    uint256 public constant MINT_PRICE = 0.01 ether; // ~ $30 on Arbitrum

    constructor() ERC721("OppForge Founder", "FORGE") Ownable(msg.sender) {}

    function mint() external payable {
        require(msg.value >= MINT_PRICE, "Insufficient ETH sent");
        uint256 tokenId = nextTokenId++;
        _safeMint(msg.sender, tokenId);
    }

    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
}
