// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title CryptoTamagotchi
 * @notice Virtual pet NFT that grows from trading activity
 * @dev Simplified version for OKX Hackathon - no external dependencies
 */
contract CryptoTamagotchi {
    // ============ State Variables ============
    
    string public name = "CryptoTamagotchi";
    string public symbol = "TAMA";
    
    uint256 private _nextTokenId;
    address public owner;
    
    // Pet stages
    enum Stage { EGG, BABY, TEEN, ADULT, LEGENDARY }
    
    struct Pet {
        uint256 xp;
        uint256 hunger;
        uint256 lastFed;
        Stage stage;
        uint256 birthTime;
        string petName;
    }
    
    // Mappings
    mapping(uint256 => Pet) public pets;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) public activePet;
    mapping(address => uint256) public balanceOf;
    mapping(address => mapping(address => bool)) public isApprovedForAll;
    
    // Evolution thresholds
    uint256 public constant EGG_THRESHOLD = 100;
    uint256 public constant BABY_THRESHOLD = 500;
    uint256 public constant TEEN_THRESHOLD = 2000;
    uint256 public constant ADULT_THRESHOLD = 10000;
    
    // Hunger mechanics
    uint256 public constant MAX_HUNGER = 100;
    uint256 public constant HUNGER_DECAY_PER_DAY = 10;
    uint256 public constant XP_PER_FEED = 10;
    
    // ============ Events ============
    
    event PetMinted(address indexed owner, uint256 tokenId, string name);
    event PetFed(uint256 indexed tokenId, uint256 xpGained, uint256 newHunger);
    event PetEvolved(uint256 indexed tokenId, Stage newStage);
    event XPAdded(uint256 indexed tokenId, uint256 amount);
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    // ============ Modifiers ============
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    // ============ Constructor ============
    
    constructor() {
        owner = msg.sender;
        _nextTokenId = 1;
    }
    
    // ============ Core Functions ============
    
    /**
     * @notice Mint a new pet egg
     * @param petName Name for your pet
     * @return tokenId The ID of the newly minted pet
     */
    function mintPet(string memory petName) public returns (uint256) {
        uint256 tokenId = _nextTokenId++;
        
        pets[tokenId] = Pet({
            xp: 0,
            hunger: 50,
            lastFed: block.timestamp,
            stage: Stage.EGG,
            birthTime: block.timestamp,
            petName: petName
        });
        
        _owners[tokenId] = msg.sender;
        balanceOf[msg.sender]++;
        
        // Set as active pet if user doesn't have one
        if (activePet[msg.sender] == 0) {
            activePet[msg.sender] = tokenId;
        }
        
        emit PetMinted(msg.sender, tokenId, petName);
        emit Transfer(address(0), msg.sender, tokenId);
        
        return tokenId;
    }
    
    /**
     * @notice Add XP to a pet (called after swap)
     * @param tokenId The pet ID
     * @param amount Amount of XP to add
     */
    function addXP(uint256 tokenId, uint256 amount) public {
        require(_owners[tokenId] != address(0), "Pet does not exist");
        require(_owners[tokenId] == msg.sender, "Not pet owner");
        
        Pet storage pet = pets[tokenId];
        
        // Calculate hunger decay
        uint256 daysSinceFed = (block.timestamp - pet.lastFed) / 1 days;
        uint256 hungerDecay = daysSinceFed * HUNGER_DECAY_PER_DAY;
        
        if (hungerDecay >= pet.hunger) {
            pet.hunger = 0;
        } else {
            pet.hunger -= hungerDecay;
        }
        
        // Add XP and feed
        pet.xp += amount;
        pet.hunger = min(pet.hunger + XP_PER_FEED, MAX_HUNGER);
        pet.lastFed = block.timestamp;
        
        emit XPAdded(tokenId, amount);
        emit PetFed(tokenId, amount, pet.hunger);
        
        // Check evolution
        _checkEvolution(tokenId);
    }
    
    /**
     * @notice Feed pet and earn XP (for demo/hackathon)
     * @param tokenId The pet ID
     */
    function feedPet(uint256 tokenId) public {
        addXP(tokenId, 50); // 50 XP per feed
    }
    
    /**
     * @notice Simulate a swap and earn XP (for hackathon demo)
     * @param tokenId The pet ID
     * @param swapVolume Volume of the swap (for XP calculation)
     */
    function simulateSwap(uint256 tokenId, uint256 swapVolume) public {
        require(_owners[tokenId] == msg.sender, "Not pet owner");
        
        // XP = swapVolume / 1e18 (assuming 18 decimals)
        uint256 xp = swapVolume / 1e18;
        if (xp > 100) xp = 100; // Cap at 100 XP per swap
        if (xp == 0) xp = 10; // Minimum 10 XP
        
        addXP(tokenId, xp);
    }
    
    // ============ View Functions ============
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner_ = _owners[tokenId];
        require(owner_ != address(0), "Pet does not exist");
        return owner_;
    }
    
    function getPet(uint256 tokenId) public view returns (Pet memory) {
        require(_owners[tokenId] != address(0), "Pet does not exist");
        return pets[tokenId];
    }
    
    function getActivePet(address user) public view returns (uint256) {
        return activePet[user];
    }
    
    function getProgressToNextStage(uint256 tokenId) public view returns (uint256) {
        Pet memory pet = pets[tokenId];
        uint256[5] memory thresholds = [uint256(0), 100, 500, 2000, 10000];
        
        uint256 currentThreshold = thresholds[uint256(pet.stage)];
        uint256 nextThreshold = thresholds[uint256(pet.stage) + 1];
        
        if (pet.stage == Stage.LEGENDARY) return 100;
        if (pet.xp >= nextThreshold) return 100;
        
        return ((pet.xp - currentThreshold) * 100) / (nextThreshold - currentThreshold);
    }
    
    // ============ Internal Functions ============
    
    function _checkEvolution(uint256 tokenId) internal {
        Pet storage pet = pets[tokenId];
        Stage newStage = pet.stage;
        
        if (pet.xp >= ADULT_THRESHOLD && pet.stage != Stage.LEGENDARY) {
            newStage = Stage.ADULT;
        } else if (pet.xp >= TEEN_THRESHOLD && uint256(pet.stage) < uint256(Stage.TEEN)) {
            newStage = Stage.TEEN;
        } else if (pet.xp >= BABY_THRESHOLD && uint256(pet.stage) < uint256(Stage.BABY)) {
            newStage = Stage.BABY;
        } else if (pet.xp >= EGG_THRESHOLD && uint256(pet.stage) < uint256(Stage.EGG)) {
            newStage = Stage.EGG;
        }
        
        if (newStage != pet.stage) {
            pet.stage = newStage;
            emit PetEvolved(tokenId, newStage);
        }
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    
    // ============ Admin Functions ============
    
    function setActivePet(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        activePet[msg.sender] = tokenId;
    }
    
    function setApprovalForAll(address operator, bool approved) public {
        isApprovedForAll[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_owners[tokenId] == from, "Not owner");
        require(
            msg.sender == from || 
            isApprovedForAll[from][msg.sender],
            "Not authorized"
        );
        
        balanceOf[from]--;
        balanceOf[to]++;
        _owners[tokenId] = to;
        
        // Update active pet if needed
        if (activePet[from] == tokenId) {
            activePet[from] = 0;
        }
        
        emit Transfer(from, to, tokenId);
    }
}
