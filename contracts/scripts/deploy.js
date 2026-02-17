const hre = require("hardhat");

async function main() {
  console.log("Starting OppForge Protocol Deployment...");

  // 1. Deploy Founder NFT
  const OppForgeFounder = await hre.ethers.getContractFactory("OppForgeFounder");
  const founder = await OppForgeFounder.deploy();
  await founder.waitForDeployment();
  console.log(`OppForgeFounder deployed to: ${await founder.getAddress()}`);

  // 3. Deploy Main Protocol (Tiers, Rewards, Funding)
  const OppForgeProtocol = await hre.ethers.getContractFactory("OppForgeProtocol");
  const protocol = await OppForgeProtocol.deploy();
  await protocol.waitForDeployment();
  console.log(`OppForgeProtocol deployed to: ${await protocol.getAddress()}`);

  console.log("Deployment Complete!");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
