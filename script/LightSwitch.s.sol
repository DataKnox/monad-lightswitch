// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

import {Script, console} from "forge-std/Script.sol";
import {LightSwitch} from "../src/LightSwitch.sol";

contract LightSwitchScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        LightSwitch lightSwitch = new LightSwitch();
        
        console.log("LightSwitch deployed at:", address(lightSwitch));

        vm.stopBroadcast();
    }
}


