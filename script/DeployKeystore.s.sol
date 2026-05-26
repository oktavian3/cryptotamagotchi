// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../contracts/CryptoTamagotchi.sol";

contract DeployKeystoreScript is Script {
    function run() external {
        address deployer = msg.sender;
        
        console.log("Deploying CryptoTamagotchi...");
        console.log("Deployer:", deployer);
        
        vm.startBroadcast();
        
        CryptoTamagotchi game = new CryptoTamagotchi();
        
        console.log("CryptoTamagotchi deployed at:", address(game));
        
        vm.stopBroadcast();
        
        // Write deployment info
        string memory deploymentInfo = string.concat(
            "GAME_ADDRESS=", vm.toString(address(game)), "\n",
            "DEPLOYER=", vm.toString(deployer), "\n",
            "NETWORK=XLayer_Testnet\n",
            "RPC=https://testrpc.xlayer.tech\n"
        );
        
        vm.writeFile(".env.deploy", deploymentInfo);
        console.log("Deployment complete! Check .env.deploy");
    }
}
