// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./IRiscZeroVerifier.sol";

/**
 * @title MockRiscZeroVerifier
 * @notice Mock implementation of RISC Zero Verifier for development
 * @dev Always succeeds verification silently.
 */
contract MockRiscZeroVerifier is IRiscZeroVerifier {
    /**
     * @notice Mock verify function that does nothing
     * @dev Succeeds silently regardless of input.
     */
    function verify(
        bytes calldata /* seal */,
        bytes32 /* imageId */,
        bytes32 /* journalHash */
    ) external pure override {
        // Do nothing, succeed silently
    }
}
