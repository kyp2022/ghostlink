// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "./IRiscZeroVerifier.sol";

/**
 * @title GhostLinkSBTDev
 * @notice Development Mock of GhostLinkSBT
 * @dev FEATURES:
 * 1. Infinite Minting: Mints successfully regardless of input data.
 * 2. No Unique Check: Same nullifier/wallet can mint unlimited times.
 * 3. Transferable: SBT restrictions removed.
 * 4. API Compatible: Matches GhostLinkSBT.sol interface exactly.
 */
contract GhostLinkSBT is ERC721, Ownable {
    using Strings for uint256;

    // ============ Types (Match Original) ============
    
    enum CredentialType {
        GITHUB,     // 0
        ALIPAY,     // 1
        TWITTER,    // 2
        WALLET      // 3
    }

    struct Credential {
        CredentialType credType;
        uint256 mintedAt;
        bytes32 nullifier;
    }

    // ============ State Variables ============
    
    IRiscZeroVerifier public verifier;
    bytes32 public imageId;
    string private _baseTokenURI;
    
    // Kept for API compatibility, but logic disables checks against it
    mapping(bytes32 => bool) public nullifiers;
    
    mapping(uint256 => Credential) public credentials;
    mapping(address => uint256[]) public userTokens;
    uint256 private _tokenIdCounter;

    // ============ Events ============
    
    event Minted(
        address indexed recipient,
        uint256 indexed tokenId,
        bytes32 indexed nullifier,
        CredentialType credType
    );
    
    event ImageIdUpdated(bytes32 oldId, bytes32 newId);
    event VerifierUpdated(address oldVerifier, address newVerifier);
    event BaseURIUpdated(string oldURI, string newURI);

    // ============ Constructor ============
    
    constructor(
        address _verifier,
        bytes32 _imageId,
        string memory _baseURI,
        string memory _name,
        string memory _symbol
    ) ERC721(_name, _symbol) Ownable(msg.sender) {
        verifier = IRiscZeroVerifier(_verifier);
        imageId = _imageId;
        _baseTokenURI = _baseURI;
        _tokenIdCounter = 1;
    }

    // ============ Core Functions (Modified for Dev) ============
    
    /**
     * @notice Mock Mint - Always succeeds, allows duplicates
     */
    function mint(
        bytes calldata seal,
        bytes32 nullifier,
        CredentialType credType
    ) external returns (uint256 tokenId) {
        // [DEV] 1. SKIP Nullifier check (Allow duplicates)
        // require(!nullifiers[nullifier], "Already minted");
        
        // [DEV] 2. SKIP ZK Verification
        // verifier.verify(seal, imageId, journalHash);

        // [DEV] 3. Mark nullifier (Optional, just to mimic state change if needed, but not blocking)
        nullifiers[nullifier] = true;

        // 4. Mint token
        tokenId = _tokenIdCounter++;
        _mint(msg.sender, tokenId);

        // 5. Record credential
        credentials[tokenId] = Credential({
            credType: credType,
            mintedAt: block.timestamp,
            nullifier: nullifier
        });

        // 6. Update user tokens
        userTokens[msg.sender].push(tokenId);

        // 7. Emit event
        emit Minted(msg.sender, tokenId, nullifier, credType);

        return tokenId;
    }

    // ============ Query Functions (Match Original) ============

    function getCredentials(address user)
        external
        view
        returns (Credential[] memory creds)
    {
        uint256[] memory tokenIds = userTokens[user];
        creds = new Credential[](tokenIds.length);

        for (uint256 i = 0; i < tokenIds.length; i++) {
            creds[i] = credentials[tokenIds[i]];
        }

        return creds;
    }

    function hasCredentialType(address user, CredentialType credType)
        external
        view
        returns (bool hasCredential)
    {
        uint256[] memory tokenIds = userTokens[user];

        for (uint256 i = 0; i < tokenIds.length; i++) {
            if (credentials[tokenIds[i]].credType == credType) {
                return true;
            }
        }

        return false;
    }

    function getCredential(uint256 tokenId)
        external
        view
        returns (Credential memory cred)
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        return credentials[tokenId];
    }
    
    // [Added helper for consistency with original if needed by frontend]
    function getUserTokenIds(address user) 
        external 
        view 
        returns (uint256[] memory tokenIds) 
    {
        return userTokens[user];
    }

    function tokenURI(uint256 tokenId) 
        public 
        view 
        override 
        returns (string memory) 
    {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        Credential memory cred = credentials[tokenId];
        string memory baseURI = _baseTokenURI;
        
        if (cred.credType == CredentialType.GITHUB) {
            return string(abi.encodePacked(baseURI, "github.json"));
        } else if (cred.credType == CredentialType.ALIPAY) {
            return string(abi.encodePacked(baseURI, "alipay.json"));
        } else if (cred.credType == CredentialType.TWITTER) {
            return string(abi.encodePacked(baseURI, "twitter.json"));
        } else {
            return string(abi.encodePacked(baseURI, "wallet.json"));
        }
    }

    // ============ Admin Functions ============
    
    function setImageId(bytes32 newImageId) external onlyOwner {
        imageId = newImageId;
        emit ImageIdUpdated(imageId, newImageId);
    }
    
    function setVerifier(address newVerifier) external onlyOwner {
        verifier = IRiscZeroVerifier(newVerifier);
        emit VerifierUpdated(address(verifier), newVerifier);
    }
    
    function setBaseTokenURI(string calldata newBaseURI) external onlyOwner {
        string memory oldURI = _baseTokenURI;
        _baseTokenURI = newBaseURI;
        emit BaseURIUpdated(oldURI, newBaseURI);
    }

    // ============ SBT Overrides REMOVED for Dev ============
    
    // [DEV] The following functions are STANDARD ERC721 now.
    // We do NOT override _update, approve, or setApprovalForAll to revert.
    // This allows transfers.

    // ============ View Functions ============
    
    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }
}
