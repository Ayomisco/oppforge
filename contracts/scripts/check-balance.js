const hre = require("hardhat");
async function main() {
  const [s] = await hre.ethers.getSigners();
  const b = await hre.ethers.provider.getBalance(s.address);
  console.log("Address:", s.address);
  console.log("Balance:", hre.ethers.formatEther(b), "ETH");
}
main().catch(e => { console.error(e); process.exit(1); });
