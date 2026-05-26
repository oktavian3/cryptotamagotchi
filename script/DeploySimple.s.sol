// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/SimplePetNFT.sol";
import "../contracts/SimpleHook.sol";

contract DeploySimpleScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying from:", deployer);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy PetNFT
        SimplePetNFT petNFT = new SimplePetNFT();
        console.log("PetNFT deployed at:", address(petNFT));
        
        // Deploy Hook
        SimpleCryptoTamagotchiHook hook = new SimpleCryptoTamagotchiHook(address(petNFT));
        console.log("Hook deployed at:", address(hook));
        
        // Set hook in PetNFT
        petNFT.setHookAddress(address(hook));
        console.log("Hook address set in PetNFT");
        
        vm.stopBroadcast();
        
        // Write deployment info
        string memory deploymentInfo = string.concat(
            "PET_NFT_ADDRESS=", vm.toString(address(petNFT)), "\n",
            "HOOK_ADDRESS=", vm.toString(address(hook)), "\n",
            "DEPLOYER=", vm.toString(deployer), "\n"
        );
        
        vm.writeFile(".env.deploy", deploymentInfo);
        console.log("Deployment complete! Check .env.deploy");
    }
}
