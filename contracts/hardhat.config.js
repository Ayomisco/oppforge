require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY || ""
const ALCHEMY_API_KEY = process.env.ALCHEMY_API_KEY || ""
const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""
const ARBISCAN_API_KEY = process.env.ARBISCAN_API_KEY || ""

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 }
    }
  },
  networks: {
    // ── Ethereum ──────────────────────────────────────────────────────────────
    mainnet: {
      url: ALCHEMY_API_KEY
        ? `https://eth-mainnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://eth.llamarpc.com",
      chainId: 1,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    sepolia: {
      url: ALCHEMY_API_KEY
        ? `https://eth-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://rpc.sepolia.org",
      chainId: 11155111,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    // ── Arbitrum ──────────────────────────────────────────────────────────────
    arbitrumSepolia: {
      url: ALCHEMY_API_KEY
        ? `https://arb-sepolia.g.alchemy.com/v2/${ALCHEMY_API_KEY}`
        : "https://sepolia-rollup.arbitrum.io/rpc",
      chainId: 421614,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    },
    arbitrumOne: {
      url: "https://arb1.arbitrum.io/rpc",
      chainId: 42161,
      accounts: PRIVATE_KEY ? [PRIVATE_KEY] : []
    }
  },
  etherscan: {
    apiKey: {
      // Ethereum
      mainnet: ETHERSCAN_API_KEY,
      sepolia: ETHERSCAN_API_KEY,
      // Arbitrum
      arbitrumOne: ARBISCAN_API_KEY,
      arbitrumSepolia: ARBISCAN_API_KEY
    }
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS === "true",
    currency: "USD"
  }
};
