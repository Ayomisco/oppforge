const hre = require("hardhat");
const fs = require("fs");

// CELO ≈ $0.60. Hunter tier = $10/month → 17 CELO
// Adjust this if CELO price changes significantly
const HUNTER_PRICE_CELO = hre.ethers.parseEther("17");

async function main() {
  const network = hre.network.name;
  const isTestnet = network === "alfajores";

  console.log(`\n🚀 Deploying OppForge Protocol to ${network} (Celo)...\n`);

  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log(`Deployer: ${deployer.address}`);
  console.log(`Balance:  ${hre.ethers.formatEther(balance)} CELO\n`);

  if (balance === 0n) {
    console.error("❌ No CELO balance. Get testnet CELO from https://faucet.celo.org (Alfajores)");
    process.exit(1);
  }

  // 1. Deploy Mission Tracker
  const OppForgeMission = await hre.ethers.getContractFactory("OppForgeMission");
  const mission = await OppForgeMission.deploy();
  await mission.waitForDeployment();
  const missionAddr = await mission.getAddress();
  console.log(`✅ OppForgeMission:   ${missionAddr}`);

  // 2. Deploy Main Protocol
  const OppForgeProtocol = await hre.ethers.getContractFactory("OppForgeProtocol");
  const protocol = await OppForgeProtocol.deploy();
  await protocol.waitForDeployment();
  const protocolAddr = await protocol.getAddress();
  console.log(`✅ OppForgeProtocol:  ${protocolAddr}`);

  // 3. Set Celo-specific HUNTER price (default is 0.005 ETH which is ~$0.003 in CELO)
  console.log(`\n⚙️  Setting HUNTER tier price to ${hre.ethers.formatEther(HUNTER_PRICE_CELO)} CELO (~$10/month)...`);
  const HUNTER_TIER = 1; // enum Tier { SCOUT=0, HUNTER=1 }
  const tx = await protocol.setTierPrice(HUNTER_TIER, HUNTER_PRICE_CELO);
  await tx.wait();
  console.log(`✅ HUNTER price set: ${hre.ethers.formatEther(HUNTER_PRICE_CELO)} CELO`);

  const addresses = {
    network,
    chainId: hre.network.config.chainId,
    currency: "CELO",
    PROTOCOL: protocolAddr,
    MISSION: missionAddr,
    hunterPriceCELO: hre.ethers.formatEther(HUNTER_PRICE_CELO),
    deployedAt: new Date().toISOString(),
    deployer: deployer.address,
  };

  const outFile = `deployed-addresses-celo${isTestnet ? "-testnet" : ""}.json`;
  fs.writeFileSync(outFile, JSON.stringify(addresses, null, 2));

  console.log("\n---------------------------------");
  console.log("Deployment Complete!");
  console.log(`Network:     ${network} (Chain ID: ${hre.network.config.chainId})`);
  console.log(`PROTOCOL:    ${protocolAddr}`);
  console.log(`MISSION:     ${missionAddr}`);
  console.log(`Hunter Price: ${hre.ethers.formatEther(HUNTER_PRICE_CELO)} CELO`);
  console.log("---------------------------------");
  console.log(`\nSaved to: ${outFile}`);
  console.log("\nUpdate these env vars:");
  console.log(`  NEXT_PUBLIC_CELO_PROTOCOL_CONTRACT=${protocolAddr}`);
  console.log(`  NEXT_PUBLIC_CELO_MISSION_CONTRACT=${missionAddr}`);
  console.log(`  CELO_PROTOCOL_CONTRACT_ADDRESS=${protocolAddr}\n`);

  // Auto-verify on Celoscan
  if (network !== "hardhat" && network !== "localhost") {
    console.log("\n⏳ Waiting 15s for Celoscan indexing...");
    await new Promise(r => setTimeout(r, 15000));
    try {
      await hre.run("verify:verify", { address: missionAddr, constructorArguments: [] });
      await hre.run("verify:verify", { address: protocolAddr, constructorArguments: [] });
      console.log("✅ Contracts verified on Celoscan!");
    } catch (e) {
      console.log("⚠️  Verification skipped (may need CELOSCAN_API_KEY or already verified):", e.message);
    }
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
