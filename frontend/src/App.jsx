import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import './App.css';

const PET_NFT_ABI = [
  "function mintPet(string memory name) public returns (uint256)",
  "function getPet(uint256 tokenId) public view returns (tuple(uint256 xp, uint256 hunger, uint256 lastFed, uint8 stage, uint256 birthTime, string name))",
  "function getActivePet(address owner) public view returns (uint256)",
  "function setActivePet(uint256 tokenId) public",
  "function ownerOf(uint256 tokenId) public view returns (address)",
  "event PetMinted(address indexed owner, uint256 tokenId, string name)",
  "event PetEvolved(uint256 indexed tokenId, uint8 newStage)"
];

const STAGE_NAMES = ['🥚 Egg', '🐣 Baby', '🐥 Teen', '🐔 Adult', '🦚 Legendary'];
const STAGE_EMOJIS = ['🥚', '🐣', '🐥', '🐔', '🦚'];

function App() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [pet, setPet] = useState(null);
  const [petId, setPetId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);

  // Contract addresses (will be updated after deploy)
  const PET_NFT_ADDRESS = '0x...'; // Update after deploy

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (account) {
      loadPet();
    }
  }, [account]);

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          setAccount(accounts[0]);
          const provider = new ethers.BrowserProvider(window.ethereum);
          setProvider(provider);
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install OKX Wallet or MetaMask');
    }
  };

  const loadPet = async () => {
    if (!provider || !account) return;
    
    try {
      const contract = new ethers.Contract(PET_NFT_ADDRESS, PET_NFT_ABI, provider);
      const activeId = await contract.getActivePet(account);
      
      if (activeId > 0) {
        setPetId(activeId.toString());
        const petData = await contract.getPet(activeId);
        setPet({
          xp: petData.xp.toString(),
          hunger: petData.hunger.toString(),
          lastFed: new Date(Number(petData.lastFed) * 1000).toLocaleDateString(),
          stage: petData.stage,
          birthTime: new Date(Number(petData.birthTime) * 1000).toLocaleDateString(),
          name: petData.name
        });
      } else {
        setShowMintModal(true);
      }
    } catch (error) {
      console.error('Error loading pet:', error);
    }
  };

  const mintPet = async () => {
    if (!provider || !account || !newPetName) return;
    
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(PET_NFT_ADDRESS, PET_NFT_ABI, signer);
      const tx = await contract.mintPet(newPetName);
      await tx.wait();
      
      setShowMintModal(false);
      setNewPetName('');
      await loadPet();
    } catch (error) {
      console.error('Error minting pet:', error);
      alert('Error minting pet. Check console.');
    }
    setLoading(false);
  };

  const getProgressToNextStage = () => {
    if (!pet) return 0;
    const xp = Number(pet.xp);
    const stage = Number(pet.stage);
    
    const thresholds = [100, 500, 2000, 10000, 50000];
    const currentThreshold = stage === 0 ? 0 : thresholds[stage - 1];
    const nextThreshold = thresholds[stage] || thresholds[thresholds.length - 1];
    
    return Math.min(100, ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  };

  const openUniswap = () => {
    window.open('https://app.uniswap.org/swap?chain=xlayer', '_blank');
  };

  if (!account) {
    return (
      <div className="app">
        <div className="connect-screen">
          <h1>🐣 CryptoTamagotchi</h1>
          <p>Your virtual pet that grows from trading!</p>
          <button className="connect-btn" onClick={connectWallet}>
            Connect Wallet
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="app">
      <header>
        <h1>🐣 CryptoTamagotchi</h1>
        <div className="account">{account.slice(0, 6)}...{account.slice(-4)}</div>
      </header>

      {showMintModal && (
        <div className="modal">
          <div className="modal-content">
            <h2>🥚 Hatch Your Pet!</h2>
            <p>Name your pet to get started:</p>
            <input
              type="text"
              value={newPetName}
              onChange={(e) => setNewPetName(e.target.value)}
              placeholder="Pet name..."
              maxLength={20}
            />
            <button onClick={mintPet} disabled={loading || !newPetName}>
              {loading ? 'Hatching...' : '🥚 Hatch Egg'}
            </button>
          </div>
        </div>
      )}

      {pet && (
        <main>
          <div className="pet-card">
            <div className="pet-emoji">{STAGE_EMOJIS[pet.stage]}</div>
            <h2>{pet.name}</h2>
            <div className="stage-badge">{STAGE_NAMES[pet.stage]}</div>
            
            <div className="stats">
              <div className="stat">
                <label>XP</label>
                <div className="progress-bar">
                  <div className="progress" style={{width: `${getProgressToNextStage()}%`}}></div>
                </div>
                <span>{pet.xp} XP</span>
              </div>
              
              <div className="stat">
                <label>Hunger</label>
                <div className="progress-bar hunger">
                  <div className="progress" style={{width: `${pet.hunger}%`}}></div>
                </div>
                <span>{pet.hunger}/100</span>
              </div>
            </div>

            <div className="info">
              <p>🎂 Born: {pet.birthTime}</p>
              <p>🍽️ Last fed: {pet.lastFed}</p>
            </div>
          </div>

          <div className="actions">
            <button className="trade-btn" onClick={openUniswap}>
              💰 Trade to Feed Pet
            </button>
            <p className="hint">Every swap earns XP and feeds your pet!</p>
          </div>

          <div className="evolution-guide">
            <h3>🚀 Evolution Guide</h3>
            <div className="stages">
              {STAGE_NAMES.map((name, idx) => (
                <div key={idx} className={`stage ${Number(pet.stage) >= idx ? 'unlocked' : ''}`}>
                  <span>{STAGE_EMOJIS[idx]}</span>
                  <small>{name}</small>
                </div>
              ))}
            </div>
          </div>
        </main>
      )}

      {!pet && !showMintModal && (
        <div className="loading">Loading pet...</div>
      )}
    </div>
  );
}

export default App;
