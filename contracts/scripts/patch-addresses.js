#!/usr/bin/env node
/**
 * Run this AFTER deployment to patch contracts.js and billing.py automatically.
 * Usage: node scripts/patch-addresses.js
 * 
 * Reads deployed-addresses.json and updates:
 *   platform/src/lib/contracts.js
 *   backend/app/routers/billing.py
 */

const fs = require('fs');
const path = require('path');

const addressFile = path.join(__dirname, '..', 'deployed-addresses.json');
if (!fs.existsSync(addressFile)) {
  console.error('❌ deployed-addresses.json not found. Run npm run deploy:arbitrum first.');
  process.exit(1);
}

const addresses = JSON.parse(fs.readFileSync(addressFile, 'utf8'));
const { PROTOCOL, FOUNDER_NFT, MISSION, network, chainId } = addresses;

console.log(`\n📋 Patching with ${network} (chainId: ${chainId}) addresses:`);
console.log(`  PROTOCOL:    ${PROTOCOL}`);
console.log(`  FOUNDER_NFT: ${FOUNDER_NFT}`);
console.log(`  MISSION:     ${MISSION}\n`);

// 1. Patch platform/src/lib/contracts.js
const contractsFile = path.join(__dirname, '../../../platform/src/lib/contracts.js');
if (fs.existsSync(contractsFile)) {
  let content = fs.readFileSync(contractsFile, 'utf8');

  // Replace import line for chain
  const isArbitrum = chainId === 42161;
  const isSepolia = chainId === 11155111;
  const chainImport = isArbitrum ? "import { arbitrum } from 'wagmi/chains'" : "import { sepolia } from 'wagmi/chains'";
  const chainVar = isArbitrum ? 'arbitrum' : 'sepolia';

  content = content.replace(/import \{.*?\} from 'wagmi\/chains'/, chainImport);
  content = content.replace(/address: '0x[a-fA-F0-9]+'(,\n\s*chainId: )sepolia\.id/, `address: '${PROTOCOL}'$1${chainVar}.id`);
  content = content.replace(/PROTOCOL:\s*\{[\s\S]*?chainId:.*?\}/m, 
    `PROTOCOL: {\n    address: '${PROTOCOL}',\n    chainId: ${chainVar}.id,\n  }`);
  content = content.replace(/FOUNDER_NFT:\s*\{[\s\S]*?chainId:.*?\}/m,
    `FOUNDER_NFT: {\n    address: '${FOUNDER_NFT}',\n    chainId: ${chainVar}.id,\n  }`);
  content = content.replace(/MISSION:\s*\{[\s\S]*?chainId:.*?\}/m,
    `MISSION: {\n    address: '${MISSION}',\n    chainId: ${chainVar}.id,\n  }`);

  fs.writeFileSync(contractsFile, content);
  console.log(`✅ Updated platform/src/lib/contracts.js`);
} else {
  console.warn(`⚠️  contracts.js not found at expected path.`);
}

// 2. Patch backend/app/routers/billing.py
const billingFile = path.join(__dirname, '../../../backend/app/routers/billing.py');
if (fs.existsSync(billingFile)) {
  let content = fs.readFileSync(billingFile, 'utf8');
  content = content.replace(/PROTOCOL_CONTRACT = "0x[a-fA-F0-9]+"/, `PROTOCOL_CONTRACT = "${PROTOCOL}"`);
  content = content.replace(/FOUNDER_NFT_CONTRACT = "0x[a-fA-F0-9]+"/, `FOUNDER_NFT_CONTRACT = "${FOUNDER_NFT}"`);
  // Update RPC URL for arbitrum
  if (isArbitrum) {
    content = content.replace(/"sepolia": ".*?"/, '"sepolia": "https://ethereum-sepolia-rpc.publicnode.com"');
    // Ensure arbitrum RPC is the default/primary
  }
  fs.writeFileSync(billingFile, content);
  console.log(`✅ Updated backend/app/routers/billing.py`);
} else {
  console.warn(`⚠️  billing.py not found at expected path.`);
}

console.log('\n🎉 Done! Now run: git add -A && git commit -m "feat: update to Arbitrum One contract addresses"');
console.log('Then push both subtrees.\n');
