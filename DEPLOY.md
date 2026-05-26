# 🚀 Deploy CryptoTamagotchi ke X Layer Testnet

## Prerequisites

1. Install Foundry: `curl -L https://foundry.paradigm.xyz | bash`
2. Get X Layer testnet ETH dari faucet
3. Setup private key

## Step-by-Step Deployment

### 1. Setup Environment

```bash
export PRIVATE_KEY=your_private_key_here
export RPC_URL=https://testrpc.xlayer.tech
```

### 2. Deploy Contract

```bash
forge script script/Deploy.s.sol --rpc-url $RPC_URL --broadcast --private-key $PRIVATE_KEY
```

### 3. Get Contract Address

Setelah deploy, check file `.env.deploy`:
```
GAME_ADDRESS=0x...
```

### 4. Update Frontend

Edit `frontend/src/App.jsx` dan update contract address:
```javascript
const GAME_ADDRESS = '0x...'; // Your deployed address
```

### 5. Run Frontend

```bash
cd frontend
npm install
npm run dev
```

## 📋 Contract ABI

```json
[
  "function mintPet(string memory name) public returns (uint256)",
  "function feedPet(uint256 tokenId) public",
  "function simulateSwap(uint256 tokenId, uint256 swapVolume) public",
  "function getPet(uint256 tokenId) public view returns (tuple(uint256 xp, uint256 hunger, uint256 lastFed, uint8 stage, uint256 birthTime, string petName))",
  "function getActivePet(address user) public view returns (uint256)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "function balanceOf(address owner) public view returns (uint256)",
  "event PetMinted(address indexed owner, uint256 tokenId, string name)",
  "event PetEvolved(uint256 indexed tokenId, uint8 newStage)"
]
```

## 🎯 X Layer Testnet Info

- **RPC**: https://testrpc.xlayer.tech
- **Chain ID**: 195
- **Explorer**: https://www.oklink.com/xlayer-testnet
- **Faucet**: https://www.oklink.com/xlayer-testnet/faucet

## 🎮 How to Use

1. **Mint Pet**: Call `mintPet("Your Pet Name")`
2. **Feed Pet**: Call `feedPet(tokenId)` — gives 50 XP
3. **Simulate Swap**: Call `simulateSwap(tokenId, volume)` — XP based on volume
4. **Check Status**: Call `getPet(tokenId)` — returns all pet stats

## 🏆 Hackathon Submission

- **Project**: CryptoTamagotchi
- **Track**: X Layer Arena
- **Features**:
  - Virtual pet NFT
  - XP system dari trading
  - Evolution stages
  - Hunger mechanics
  - Mobile-friendly UI

## 📄 License

MIT
