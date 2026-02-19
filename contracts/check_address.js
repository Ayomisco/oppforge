const { ethers } = require("ethers");
require("dotenv").config();

async function main() {
  const pk = process.env.PRIVATE_KEY;
  if (!pk) {
    console.log("No PRIVATE_KEY found in .env");
    return;
  }
  try {
    const wallet = new ethers.Wallet(pk);
    console.log("Wallet Address:", wallet.address);
  } catch (e) {
    console.log("Invalid Private Key");
  }
}

main();
