// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract PredictionProofRegistry {
    address public owner;

    struct Proof {
        string matchId;
        string modelVersion;
        bytes32 predictionHash;
        uint256 createdAt;
    }

    mapping(bytes32 => Proof) public proofs;

    event ProofStored(
        string matchId,
        string modelVersion,
        bytes32 predictionHash,
        uint256 createdAt
    );

    constructor() {
        owner = msg.sender;
    }

    function storeProof(
        string calldata matchId,
        string calldata modelVersion,
        bytes32 predictionHash
    ) external {
        require(predictionHash != bytes32(0), "Invalid prediction hash");
        require(proofs[predictionHash].createdAt == 0, "Proof already exists");

        proofs[predictionHash] = Proof({
            matchId: matchId,
            modelVersion: modelVersion,
            predictionHash: predictionHash,
            createdAt: block.timestamp
        });

        emit ProofStored(
            matchId,
            modelVersion,
            predictionHash,
            block.timestamp
        );
    }

    function proofExists(bytes32 predictionHash) external view returns (bool) {
        return proofs[predictionHash].createdAt != 0;
    }
}