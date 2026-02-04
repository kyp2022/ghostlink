// OAuth Configuration（优先 Vite 环境变量；未配置则使用默认值，方便一键部署/演示）
export const GITHUB_CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || "Iv23li88rvwnNxTsjlfc";
export const TWITTER_CLIENT_ID = import.meta.env.VITE_TWITTER_CLIENT_ID || "Y2ZMMWgzOGNNYjdISDhVZ1BHNjc6MTpjaQ";

// The redirect URI must match what you configured in GitHub App settings
export const REDIRECT_URI = window.location.origin + window.location.pathname;

// Contract Configuration0x9C635808bE88E725892FB6Fbe2C99BA988C30D91
export const CONTRACT_ADDRESS = "0xe62f6F1E02507880a561A8cd7a88050E61CFA4Ad";
// Using Alchemy's free public Sepolia RPC (supports CORS)
export const RPC_URL = "https://eth-sepolia.g.alchemy.com/v2/demo";
export const CHAIN_ID = 11155111; // Sepolia

// Contract ABI - Updated for GhostLinkSBT v2.0
export const CONTRACT_ABI = [
    // Core minting function
    "function mint(bytes calldata seal, bytes32 nullifier, uint8 credType) external returns (uint256)",

    // Query functions
    "function getCredentials(address user) external view returns (tuple(uint8 credType, uint256 mintedAt, bytes32 nullifier)[])",
    "function hasCredentialType(address user, uint8 credType) external view returns (bool)",
    "function getCredential(uint256 tokenId) external view returns (tuple(uint8 credType, uint256 mintedAt, bytes32 nullifier))",
    "function getUserTokenIds(address user) external view returns (uint256[])",

    // View functions
    "function imageId() external view returns (bytes32)",
    "function verifier() external view returns (address)",
    "function nullifiers(bytes32) external view returns (bool)",
    "function credentials(uint256) external view returns (uint8 credType, uint256 mintedAt, bytes32 nullifier)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    "function name() external view returns (string)",
    "function symbol() external view returns (string)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",

    // Events
    "event Minted(address indexed recipient, uint256 indexed tokenId, bytes32 indexed nullifier, uint8 credType)"
];

// Credential type enum (matches contract)
export const CREDENTIAL_TYPE = {
    GITHUB: 0,
    ALIPAY: 1,
    TWITTER: 2,
    WALLET: 3
};
