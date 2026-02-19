const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("OppForge Protocol", function () {
  let OppForgeProtocol, protocol, owner, addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    OppForgeProtocol = await ethers.getContractFactory("OppForgeProtocol");
    protocol = await OppForgeProtocol.deploy();
  });

  it("Should set the correct tier prices", async function () {
    expect(await protocol.tierPrices(1)).to.equal(ethers.parseEther("0.05")); // HUNTER
    expect(await protocol.tierPrices(2)).to.equal(ethers.parseEther("0.2"));  // FOUNDER
  });

  it("Should allow upgrading tier", async function () {
    const hunterPrice = await protocol.tierPrices(1);
    await protocol.connect(addr1).upgradeTier(1, { value: hunterPrice });
    
    const profile = await protocol.userProtocols(addr1.address);
    expect(profile.tier).to.equal(1); // HUNTER
  });

  it("Should allow funding a mission", async function () {
    const missionId = ethers.keccak256(ethers.toUtf8Bytes("mission1"));
    await protocol.fundMission(missionId, { value: ethers.parseEther("0.1") });
    
    expect(await protocol.missionVaults(missionId)).to.equal(ethers.parseEther("0.1"));
  });
});
