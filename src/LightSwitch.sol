// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.13;

contract LightSwitch {
    bool public isOn = false; // Switch is off by default
    uint256 public constant TOGGLE_PRICE = 0.5 ether; // 0.5 Ether (used as MON's unit, since 1 ether = 10^18 base units on EVM chains)

    event SwitchToggled(bool newState, address indexed user);

    /**
     * @dev Toggle the light switch state
     * Requires payment of exactly 0.5 MON
     */
    function toggle() public payable {
        require(
            msg.value == TOGGLE_PRICE,
            "Must pay exactly 0.5 MON to toggle"
        );

        isOn = !isOn;

        emit SwitchToggled(isOn, msg.sender);
    }

    /**
     * @dev Get the current state of the switch
     */
    function getState() public view returns (bool) {
        return isOn;
    }

    /**
     * @dev Allow owner to withdraw funds
     */
    function withdraw() public {
        payable(msg.sender).transfer(address(this).balance);
    }
}
