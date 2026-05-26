// Contract ABI for CryptoTamagotchi
export const CONTRACT_ABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" }
    ],
    "name": "addXP",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "feedPet",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "address", "name": "user", "type": "address" }],
    "name": "getActivePet",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "getPet",
    "outputs": [
      {
        "components": [
          { "internalType": "uint256", "name": "xp", "type": "uint256" },
          { "internalType": "uint256", "name": "hunger", "type": "uint256" },
          { "internalType": "uint256", "name": "lastFed", "type": "uint256" },
          { "internalType": "enum CryptoTamagotchi.Stage", "name": "stage", "type": "uint8" },
          { "internalType": "uint256", "name": "birthTime", "type": "uint256" },
          { "internalType": "string", "name": "petName", "type": "string" }
        ],
        "internalType": "struct CryptoTamagotchi.Pet",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "internalType": "uint256", "name": "swapVolume", "type": "uint256" }
    ],
    "name": "simulateSwap",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "string", "name": "petName", "type": "string" }],
    "name": "mintPet",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }],
    "name": "ownerOf",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "address", "name": "owner", "type": "address" },
      { "indexed": false, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "string", "name": "name", "type": "string" }
    ],
    "name": "PetMinted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" },
      { "indexed": false, "internalType": "enum CryptoTamagotchi.Stage", "name": "newStage", "type": "uint8" }
    ],
    "name": "PetEvolved",
    "type": "event"
  }
];

// DEPLOYED ON X LAYER TESTNET
export const CONTRACT_ADDRESS = '0x63A26225eD64DF9A92D276Edfc6d7F2234C91F3e';

// X Layer Testnet Config
export const XLAYER_CONFIG = {
  chainId: '0xc3', // 195 in hex
  chainName: 'X Layer Testnet',
  nativeCurrency: {
    name: 'OKB',
    symbol: 'OKB',
    decimals: 18
  },
  rpcUrls: ['https://testrpc.xlayer.tech'],
  blockExplorerUrls: ['https://www.oklink.com/xlayer-testnet']
};
