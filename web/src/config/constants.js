// OAuth Configuration
export const GITHUB_CLIENT_ID = "Iv23li88rvwnNxTsjlfc";
export const TWITTER_CLIENT_ID = "Y2ZMMWgzOGNNYjdISDhVZ1BHNjc6MTpjaQ";

// The redirect URI must match what you configured in GitHub App settings
export const REDIRECT_URI = window.location.origin + window.location.pathname;

// Contract Configuration
export const CONTRACT_ADDRESS = "0x79983eA479BfeD6d597A0e7420E13ae7Ac0c0445";
export const RPC_URL = "https://sepolia.infura.io/v3/YOUR_INFURA_KEY";
export const CHAIN_ID = 11155111; // Sepolia

// Contract ABI
export const CONTRACT_ABI = [
    "function mint(bytes calldata seal, address recipient, bytes32 nullifier) external",
    "function imageId() external view returns (bytes32)",
    "function verifier() external view returns (address)",
    "function nullifiers(bytes32) external view returns (bool)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "event Minted(address indexed recipient, uint256 indexed tokenId, bytes32 nullifier)"
];

// API Configuration
export const API_BASE_URL = "http://localhost:8080";
