const hre = require("hardhat");

async function main() {
  console.log("Starting OppForge Protocol Deployment...");

  // 1. Deploy Founder NFT
  const OppForgeFounder = await hre.ethers.getContractFactory("OppForgeFounder");
  const founder = await OppForgeFounder.deploy();
  await founder.waitForDeployment();
  console.log(`OppForgeFounder deployed to: ${await founder.getAddress()}`);

  // 2. Deploy Mission Tracker (Reputation, Status)
  const OppForgeMission = await hre.ethers.getContractFactory("OppForgeMission");
  const mission = await OppForgeMission.deploy();
  await mission.waitForDeployment();
  console.log(`OppForgeMission deployed to: ${await mission.getAddress()}`);

  // 3. Deploy Main Protocol (Tiers, Rewards, Funding)
  const OppForgeProtocol = await hre.ethers.getContractFactory("OppForgeProtocol");
  const protocol = await OppForgeProtocol.deploy();
  await protocol.waitForDeployment();
  console.log(`OppForgeProtocol deployed to: ${await protocol.getAddress()}`);

  console.log("Deployment Complete!");
  console.log("---------------------------------");
  console.log(`FOUNDER_NFT: ${await founder.getAddress()}`);
  console.log(`MISSION_TRACKER: ${await mission.getAddress()}`);
  console.log(`MAIN_PROTOCOL: ${await protocol.getAddress()}`);
  console.log("---------------------------------");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
