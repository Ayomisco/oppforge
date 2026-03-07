/**
 * OppForge – Ethereum Deployment Script
 * 
 * Deploys all contracts and verifies them on Etherscan.
 *
 * Usage:
 *   Testnet:  npx hardhat run scripts/deploy-ethereum.js --network sepolia
 *   Mainnet:  npx hardhat run scripts/deploy-ethereum.js --network mainnet
 *
 * After deployment verify manually if auto-verify fails:
 *   npx hardhat verify --network sepolia <CONTRACT_ADDRESS>
 */

const hre = require("hardhat");

async function verify(address, constructorArgs = []) {
  try {
    console.log(`\nVerifying ${address} on Etherscan...`);
    await hre.run("verify:verify", {
      address,
      constructorArguments: constructorArgs,
    });
    console.log(`✅  Verified: ${address}`);
  } catch (err) {
    if (err.message.toLowerCase().includes("already verified")) {
      console.log(`ℹ️  Already verified: ${address}`);
    } else {
      console.warn(`⚠️  Verification failed: ${err.message}`);
    }
  }
}

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const network = hre.network.name;
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("═══════════════════════════════════════════════════");
  console.log("  OppForge Protocol — Ethereum Deployment");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  Network  : ${network}`);
  console.log(`  Deployer : ${deployer.address}`);
  console.log(`  Balance  : ${hre.ethers.formatEther(balance)} ETH`);
  console.log("═══════════════════════════════════════════════════\n");

  if (balance === 0n) {
    throw new Error("Deployer wallet has 0 ETH — top it up before deploying.");
  }

  const deployed = {};

  // ── 1. OppForgeFounder (ERC-721 Founder Pass) ─────────────────────────────
  console.log("Deploying OppForgeFounder...");
  const Founder = await hre.ethers.getContractFactory("OppForgeFounder");
  const founder = await Founder.deploy();
  await founder.waitForDeployment();
  deployed.founder = await founder.getAddress();
  console.log(`  OppForgeFounder → ${deployed.founder}`);

  // ── 2. OppForgeMission (Reputation + Status Tracker) ──────────────────────
  console.log("Deploying OppForgeMission...");
  const Mission = await hre.ethers.getContractFactory("OppForgeMission");
  const mission = await Mission.deploy();
  await mission.waitForDeployment();
  deployed.mission = await mission.getAddress();
  console.log(`  OppForgeMission  → ${deployed.mission}`);

  // ── 3. OppForgeProtocol (Tiers / Rewards / Funding) ───────────────────────
  console.log("Deploying OppForgeProtocol...");
  const Protocol = await hre.ethers.getContractFactory("OppForgeProtocol");
  const protocol = await Protocol.deploy();
  await protocol.waitForDeployment();
  deployed.protocol = await protocol.getAddress();
  console.log(`  OppForgeProtocol → ${deployed.protocol}`);

  // ── Summary ───────────────────────────────────────────────────────────────
  console.log("\n═══════════════════════════════════════════════════");
  console.log("  Deployment Complete");
  console.log("═══════════════════════════════════════════════════");
  console.log(`  FOUNDER_NFT      = ${deployed.founder}`);
  console.log(`  MISSION_TRACKER  = ${deployed.mission}`);
  console.log(`  MAIN_PROTOCOL    = ${deployed.protocol}`);
  console.log("═══════════════════════════════════════════════════\n");

  console.log("📋 Add these to your .env (backend):");
  console.log(`FOUNDER_CONTRACT_ADDRESS=${deployed.founder}`);
  console.log(`MISSION_CONTRACT_ADDRESS=${deployed.mission}`);
  console.log(`PROTOCOL_CONTRACT_ADDRESS=${deployed.protocol}`);

  // ── Etherscan Verification ────────────────────────────────────────────────
  // Wait for Etherscan to index the contracts (5 confirmations recommended)
  console.log("\nWaiting for Etherscan indexing (30s)...");
  await new Promise(r => setTimeout(r, 30_000));

  await verify(deployed.founder);
  await verify(deployed.mission);
  await verify(deployed.protocol);

  console.log("\n✅  All done.");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
