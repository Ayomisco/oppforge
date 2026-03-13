const hre = require("hardhat");
const fs = require("fs");

async function main() {
  const network = hre.network.name;
  console.log(`\n🚀 Deploying OppForge Protocol to ${network}...\n`);

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${hre.ethers.formatEther(balance)} ETH\n`);

  // 1. Deploy Founder NFT
  const OppForgeFounder = await hre.ethers.getContractFactory("OppForgeFounder");
  const founder = await OppForgeFounder.deploy();
  await founder.waitForDeployment();
  const founderAddr = await founder.getAddress();
  console.log(`✅ OppForgeFounder NFT:  ${founderAddr}`);

  // 2. Deploy Mission Tracker
  const OppForgeMission = await hre.ethers.getContractFactory("OppForgeMission");
  const mission = await OppForgeMission.deploy();
  await mission.waitForDeployment();
  const missionAddr = await mission.getAddress();
  console.log(`✅ OppForgeMission:      ${missionAddr}`);

  // 3. Deploy Main Protocol (Tiers, Rewards, Funding)
  const OppForgeProtocol = await hre.ethers.getContractFactory("OppForgeProtocol");
  const protocol = await OppForgeProtocol.deploy();
  await protocol.waitForDeployment();
  const protocolAddr = await protocol.getAddress();
  console.log(`✅ OppForgeProtocol:     ${protocolAddr}`);

  const addresses = {
    network,
    chainId: hre.network.config.chainId,
    PROTOCOL: protocolAddr,
    FOUNDER_NFT: founderAddr,
    MISSION: missionAddr,
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  // Save addresses to file
  fs.writeFileSync("deployed-addresses.json", JSON.stringify(addresses, null, 2));

  console.log("\n---------------------------------");
  console.log("Deployment Complete!");
  console.log(`PROTOCOL:    ${protocolAddr}`);
  console.log(`FOUNDER_NFT: ${founderAddr}`);
  console.log(`MISSION:     ${missionAddr}`);
  console.log("---------------------------------");
  console.log("\nUpdate these in:");
  console.log("  platform/src/lib/contracts.js");
  console.log("  backend/app/routers/billing.py\n");

  // Auto-verify on Etherscan/Arbiscan if not local
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n⏳ Waiting 10s for Arbiscan indexing...");
    await new Promise(r => setTimeout(r, 10000));
    try {
      await hre.run("verify:verify", { address: founderAddr, constructorArguments: [] });
      await hre.run("verify:verify", { address: missionAddr, constructorArguments: [] });
      await hre.run("verify:verify", { address: protocolAddr, constructorArguments: [] });
      console.log("✅ All contracts verified on Arbiscan!");
    } catch (e) {
      console.log("⚠️  Verification failed (may already be verified):", e.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
