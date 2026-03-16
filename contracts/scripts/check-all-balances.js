const { ethers } = require('ethers');
const ALCHEMY_KEY = process.env.ALCHEMY_API_KEY || 'A4flIcxFitRYpoWndHzTe';

async function check() {
  const addr = '0xE5978059D18c0B840A3F33389dc4425465442E69';
  
  const chains = [
    ['Arbitrum One', 'https://arb-mainnet.g.alchemy.com/v2/' + ALCHEMY_KEY],
    ['Eth Mainnet', 'https://eth-mainnet.g.alchemy.com/v2/' + ALCHEMY_KEY],
    ['Arb Sepolia', 'https://arb-sepolia.g.alchemy.com/v2/' + ALCHEMY_KEY],
    ['Eth Sepolia', 'https://eth-sepolia.g.alchemy.com/v2/' + ALCHEMY_KEY],
  ];
  
  console.log('Wallet:', addr);
  console.log('---');
  for (const [name, url] of chains) {
    try {
      const provider = new ethers.JsonRpcProvider(url);
      const bal = await provider.getBalance(addr);
      console.log(name + ':', ethers.formatEther(bal), 'ETH');
    } catch(e) {
      console.log(name + ': error -', e.message.substring(0, 80));
    }
  }
}
check().catch(console.error);
