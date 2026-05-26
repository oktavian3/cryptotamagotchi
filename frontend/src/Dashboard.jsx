import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { CONTRACT_ABI, CONTRACT_ADDRESS, XLAYER_CONFIG } from './contract';
import './Dashboard.css';

const STAGE_NAMES = ['Egg', 'Baby', 'Teen', 'Adult', 'Legendary'];
const STAGE_EMOJIS = ['🥚', '🐣', '🐥', '🐔', '🦚'];
const STAGE_COLORS = ['#FFD93D', '#6BCB77', '#4D96FF', '#FF6B6B', '#9B59B6'];

function Dashboard() {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [pet, setPet] = useState(null);
  const [petId, setPetId] = useState(0);
  const [loading, setLoading] = useState(false);
  const [newPetName, setNewPetName] = useState('');
  const [showMintModal, setShowMintModal] = useState(false);
  const [feedAnimation, setFeedAnimation] = useState(false);
  const [xpGain, setXpGain] = useState(0);

  useEffect(() => {
    checkWallet();
  }, []);

  useEffect(() => {
    if (account && contract) {
      loadPet();
    }
  }, [account, contract]);

  const checkWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        // Try to switch to X Layer Testnet
        try {
          await window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: XLAYER_CONFIG.chainId }],
          });
        } catch (switchError) {
          // If network doesn't exist, add it
          if (switchError.code === 4902) {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [XLAYER_CONFIG],
            });
          }
        }

        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        setAccount(accounts[0]);
        
        const provider = new ethers.BrowserProvider(window.ethereum);
        const signer = await provider.getSigner();
        const contract = new ethers.Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer);
        
        setProvider(provider);
        setSigner(signer);
        setContract(contract);
      } catch (error) {
        console.error('Error connecting wallet:', error);
      }
    } else {
      alert('Please install OKX Wallet or MetaMask');
    }
  };

  const loadPet = async () => {
    if (!contract || !account) return;
    
    try {
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
          name: petData.petName
        });
      } else {
        setShowMintModal(true);
      }
    } catch (error) {
      console.error('Error loading pet:', error);
    }
  };

  const mintPet = async () => {
    if (!contract || !newPetName) return;
    
    setLoading(true);
    try {
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

  const feedPet = async () => {
    if (!contract || !petId) return;
    
    setLoading(true);
    try {
      const tx = await contract.feedPet(petId);
      await tx.wait();
      
      setFeedAnimation(true);
      setXpGain(50);
      setTimeout(() => {
        setFeedAnimation(false);
        setXpGain(0);
      }, 2000);
      
      await loadPet();
    } catch (error) {
      console.error('Error feeding pet:', error);
    }
    setLoading(false);
  };

  const simulateSwap = async () => {
    if (!contract || !petId) return;
    
    setLoading(true);
    try {
      // Simulate a $100 swap = 100 XP
      const swapVolume = ethers.parseEther('100');
      const tx = await contract.simulateSwap(petId, swapVolume);
      await tx.wait();
      
      setFeedAnimation(true);
      setXpGain(100);
      setTimeout(() => {
        setFeedAnimation(false);
        setXpGain(0);
      }, 2000);
      
      await loadPet();
    } catch (error) {
      console.error('Error simulating swap:', error);
    }
    setLoading(false);
  };

  const getProgressToNextStage = () => {
    if (!pet) return 0;
    const xp = Number(pet.xp);
    const stage = Number(pet.stage);
    
    const thresholds = [0, 100, 500, 2000, 10000];
    const currentThreshold = thresholds[stage];
    const nextThreshold = thresholds[stage + 1] || thresholds[thresholds.length - 1];
    
    if (stage === 4) return 100;
    return Math.min(100, ((xp - currentThreshold) / (nextThreshold - currentThreshold)) * 100);
  };

  const getDaysAlive = () => {
    if (!pet) return 0;
    const birth = new Date(pet.birthTime);
    const now = new Date();
    return Math.floor((now - birth) / (1000 * 60 * 60 * 24));
  };

  if (!account) {
    return (
      <div className="dashboard">
        <div className="connect-screen">
          <div className="logo">
            <span className="logo-emoji">🐣</span>
            <h1>CryptoTamagotchi</h1>
          </div>
          <p className="tagline">Your virtual pet that grows from trading</p>
          <div className="features">
            <div className="feature">
              <span>🎮</span>
              <p>Trade to feed your pet</p>
            </div>
            <div className="feature">
              <span>📈</span>
              <p>Watch it evolve</p>
            </div>
            <div className="feature">
              <span>🏆</span>
              <p>Compete on leaderboard</p>
            </div>
          </div>
          <button className="connect-btn" onClick={connectWallet}>
            <span>Connect Wallet</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      {/* Background Effects */}
      <div className="bg-effects">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>

      {/* Header */}
      <header className="header">
        <div className="logo-small">
          <span>🐣</span>
          <span className="logo-text">CryptoTamagotchi</span>
        </div>
        <div className="account-badge">
          <div className="status-dot"></div>
          <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
        </div>
      </header>

      {/* Mint Modal */}
      {showMintModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-icon">🥚</div>
            <h2>Hatch Your Pet!</h2>
            <p>Give your pet a name to begin the journey</p>
            <div className="input-group">
              <input
                type="text"
                value={newPetName}
                onChange={(e) => setNewPetName(e.target.value)}
                placeholder="Enter pet name..."
                maxLength={20}
              />
              <span className="char-count">{newPetName.length}/20</span>
            </div>
            <button 
              className="btn-primary"
              onClick={mintPet} 
              disabled={loading || !newPetName}
            >
              {loading ? (
                <span className="spinner"></span>
              ) : (
                <>
                  <span>Hatch Egg</span>
                  <span>🥚</span>
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      {pet && (
        <main className="main-content">
          {/* Pet Card */}
          <div className="pet-card" style={{'--stage-color': STAGE_COLORS[pet.stage]}}>
            <div className={`pet-avatar ${feedAnimation ? 'feeding' : ''}`}>
              <span className="pet-emoji">{STAGE_EMOJIS[pet.stage]}</span>
              {feedAnimation && (
                <div className="xp-popup">
                  <span>+{xpGain} XP</span>
                </div>
              )}
            </div>
            
            <div className="pet-info">
              <h2 className="pet-name">{pet.name}</h2>
              <div className="stage-badge" style={{background: STAGE_COLORS[pet.stage]}}>
                {STAGE_NAMES[pet.stage]}
              </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">✨</div>
                <div className="stat-value">{pet.xp}</div>
                <div className="stat-label">Total XP</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">📅</div>
                <div className="stat-value">{getDaysAlive()}</div>
                <div className="stat-label">Days Alive</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">🎯</div>
                <div className="stat-value">{Math.round(getProgressToNextStage())}%</div>
                <div className="stat-label">To Next Stage</div>
              </div>
            </div>

            {/* XP Progress */}
            <div className="progress-section">
              <div className="progress-header">
                <span>Progress to {STAGE_NAMES[Math.min(4, Number(pet.stage) + 1)]}</span>
                <span>{pet.xp} XP</span>
              </div>
              <div className="progress-bar">
                <div 
                  className="progress-fill"
                  style={{width: `${getProgressToNextStage()}%`, background: STAGE_COLORS[pet.stage]}}
                ></div>
              </div>
            </div>

            {/* Hunger Meter */}
            <div className="progress-section">
              <div className="progress-header">
                <span>Hunger Level</span>
                <span>{pet.hunger}/100</span>
              </div>
              <div className="progress-bar hunger">
                <div 
                  className="progress-fill"
                  style={{
                    width: `${pet.hunger}%`,
                    background: pet.hunger < 30 ? '#ff4757' : pet.hunger < 60 ? '#ffa502' : '#2ed573'
                  }}
                ></div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="actions">
            <button 
              className="action-btn feed"
              onClick={feedPet}
              disabled={loading}
            >
              <span className="btn-icon">🍖</span>
              <div className="btn-text">
                <span className="btn-title">Feed Pet</span>
                <span className="btn-subtitle">+50 XP</span>
              </div>
            </button>
            
            <button 
              className="action-btn trade"
              onClick={simulateSwap}
              disabled={loading}
            >
              <span className="btn-icon">💰</span>
              <div className="btn-text">
                <span className="btn-title">Simulate Trade</span>
                <span className="btn-subtitle">+100 XP</span>
              </div>
            </button>
          </div>

          {/* Evolution Timeline */}
          <div className="evolution-timeline">
            <h3>Evolution Path</h3>
            <div className="timeline">
              {STAGE_NAMES.map((name, idx) => (
                <div 
                  key={idx} 
                  className={`timeline-item ${Number(pet.stage) >= idx ? 'completed' : ''} ${Number(pet.stage) === idx ? 'current' : ''}`}
                >
                  <div className="timeline-dot" style={{background: STAGE_COLORS[idx]}}>
                    {STAGE_EMOJIS[idx]}
                  </div>
                  <span className="timeline-label">{name}</span>
                  {idx < 4 && <div className="timeline-line"></div>}
                </div>
              ))}
            </div>
          </div>
        </main>
      )}
    </div>
  );
}

export default Dashboard;
