// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IPetNFT {
    function addXP(uint256 tokenId, uint256 amount) external;
    function activePet(address owner) external view returns (uint256);
    function ownerOf(uint256 tokenId) external view returns (address);
}

// Simplified hook for hackathon demo
// In production, inherit from BaseHook and implement full IHooks interface
contract SimpleCryptoTamagotchiHook {
    IPetNFT public petNFT;
    address public owner;
    
    uint256 public constant XP_PER_DOLLAR = 1;
    uint256 public constant MAX_XP_PER_SWAP = 100;
    
    mapping(address => uint256) public dailySwapCount;
    mapping(address => uint256) public lastSwapDay;
    
    event XPMinted(address indexed user, uint256 tokenId, uint256 xpAmount, uint256 swapVolume);
    event SwapProcessed(address indexed user, uint256 activePetId, uint256 volume);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    constructor(address _petNFT) {
        petNFT = IPetNFT(_petNFT);
        owner = msg.sender;
    }
    
    // This function would be called by a keeper/oracle after swap detection
    // For hackathon demo, users can call this manually or via frontend
    function processSwap(address user, uint256 swapVolume) external {
        uint256 activePetId = petNFT.activePet(user);
        if (activePetId == 0) {
            return;
        }
        
        // Verify ownership
        if (petNFT.ownerOf(activePetId) != user) {
            return;
        }
        
        // Calculate XP
        uint256 usdValue = swapVolume / 1e18;
        uint256 xpAmount = usdValue * XP_PER_DOLLAR;
        
        // Update streak
        uint256 currentDay = block.timestamp / 1 days;
        if (lastSwapDay[user] != currentDay) {
            dailySwapCount[user] = 1;
            lastSwapDay[user] = currentDay;
        } else {
            dailySwapCount[user]++;
        }
        
        // Bonus XP for streaks
        uint256 streakBonus = dailySwapCount[user] > 1 ? dailySwapCount[user] - 1 : 0;
        xpAmount = xpAmount + streakBonus;
        
        if (xpAmount > MAX_XP_PER_SWAP) {
            xpAmount = MAX_XP_PER_SWAP;
        }
        
        // Mint XP to pet
        petNFT.addXP(activePetId, xpAmount);
        
        emit XPMinted(user, activePetId, xpAmount, swapVolume);
    }
    
    // For demo: manual feed function
    function feedPet(uint256 amount) external {
        uint256 activePetId = petNFT.activePet(msg.sender);
        require(activePetId != 0, "No active pet");
        require(petNFT.ownerOf(activePetId) == msg.sender, "Not owner");
        
        petNFT.addXP(activePetId, amount);
        emit XPMinted(msg.sender, activePetId, amount, amount * 1e18);
    }
    
    function setPetNFT(address _petNFT) external onlyOwner {
        petNFT = IPetNFT(_petNFT);
    }
}
