// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

// Minimal ERC721 implementation for hackathon
contract SimplePetNFT {
    string public name = "CryptoTamagotchi";
    string public symbol = "TAMA";
    
    uint256 private _nextTokenId;
    
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
    
    mapping(uint256 => Pet) public pets;
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) public activePet;
    mapping(address => uint256) public balanceOf;
    
    // Evolution thresholds
    uint256 public constant EGG_THRESHOLD = 100;
    uint256 public constant BABY_THRESHOLD = 500;
    uint256 public constant TEEN_THRESHOLD = 2000;
    uint256 public constant ADULT_THRESHOLD = 10000;
    
    // Hunger mechanics
    uint256 public constant MAX_HUNGER = 100;
    uint256 public constant HUNGER_DECAY_PER_DAY = 10;
    
    address public hookAddress;
    address public owner;
    
    event PetMinted(address indexed owner, uint256 tokenId, string name);
    event PetFed(uint256 indexed tokenId, uint256 xpGained, uint256 newHunger);
    event PetEvolved(uint256 indexed tokenId, Stage newStage);
    event XPAdded(uint256 indexed tokenId, uint256 amount);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    modifier onlyHook() {
        require(msg.sender == hookAddress, "Not hook");
        _;
    }
    
    constructor() {
        owner = msg.sender;
        _nextTokenId = 1;
    }
    
    function setHookAddress(address _hook) external onlyOwner {
        hookAddress = _hook;
    }
    
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
        
        if (activePet[msg.sender] == 0) {
            activePet[msg.sender] = tokenId;
        }
        
        emit PetMinted(msg.sender, tokenId, petName);
        return tokenId;
    }
    
    function addXP(uint256 tokenId, uint256 amount) external onlyHook {
        require(_owners[tokenId] != address(0), "Pet does not exist");
        
        Pet storage pet = pets[tokenId];
        
        uint256 daysSinceFed = (block.timestamp - pet.lastFed) / 1 days;
        uint256 hungerDecay = daysSinceFed * HUNGER_DECAY_PER_DAY;
        
        if (hungerDecay >= pet.hunger) {
            pet.hunger = 0;
        } else {
            pet.hunger -= hungerDecay;
        }
        
        pet.xp += amount;
        pet.hunger = min(pet.hunger + 10, MAX_HUNGER);
        pet.lastFed = block.timestamp;
        
        emit XPAdded(tokenId, amount);
        emit PetFed(tokenId, amount, pet.hunger);
        
        _checkEvolution(tokenId);
    }
    
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
    
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner_ = _owners[tokenId];
        require(owner_ != address(0), "Pet does not exist");
        return owner_;
    }
    
    function getPet(uint256 tokenId) public view returns (Pet memory) {
        require(_owners[tokenId] != address(0), "Pet does not exist");
        return pets[tokenId];
    }
    
    function setActivePet(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        activePet[msg.sender] = tokenId;
    }
    
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
}
