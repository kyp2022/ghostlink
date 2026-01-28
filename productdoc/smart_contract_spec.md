# GhostLink 智能合约设计规范

> **文档版本**: v2.0  
> **日期**: 2026-01-26  
> **状态**: 待评审  
> **与 RISC Zero 规范配套使用**

---

## 1. 概述

GhostLink 智能合约负责：
- 验证 RISC Zero 生成的零知识证明
- 铸造不可转让的 SBT（灵魂绑定代币）
- 防止同一身份重复铸造

---

## 2. 合约架构

```
┌─────────────────────────────────────────────────────────────┐
│                    GhostLinkSBT.sol                         │
│  ┌───────────────┐  ┌───────────────┐  ┌─────────────────┐  │
│  │    ERC721     │  │  SBT 逻辑     │  │  ZK 验证模块    │  │
│  │  (不可转让)   │  │ (铸造/查询)   │  │ (调用Verifier) │  │
│  └───────────────┘  └───────────────┘  └─────────────────┘  │
└───────────────────────────┬─────────────────────────────────┘
                            │
                            ▼
                ┌───────────────────────┐
                │  IRiscZeroVerifier    │
                │  (RISC Zero 官方合约) │
                └───────────────────────┘
```

---

## 3. 凭证类型

```solidity
enum CredentialType {
    GITHUB,     // 0
    ALIPAY,     // 1
    TWITTER,    // 2
    WALLET      // 3
}
```

---

## 4. 核心数据结构

```solidity
struct Credential {
    CredentialType credType;   // 凭证类型
    uint256 mintedAt;          // 铸造时间戳
    bytes32 nullifier;         // 唯一标识符（防重复）
}
```

---

## 5. 状态变量

| 变量 | 类型 | 说明 |
|------|------|------|
| `verifier` | `IRiscZeroVerifier` | RISC Zero 验证器地址（由贵方提供） |
| `imageId` | `bytes32` | Guest 程序 Image ID（由贵方提供） |
| `nullifiers` | `mapping(bytes32 => bool)` | 已使用的 nullifier |
| `credentials` | `mapping(uint256 => Credential)` | tokenId → 凭证详情 |
| `userTokens` | `mapping(address => uint256[])` | 用户地址 → tokenId 列表 |

---

## 6. 核心函数

### 6.1 铸造

```solidity
function mint(
    bytes calldata seal,        // ZK 证明（receipt_hex）
    bytes32 nullifier,          // 防重复标识
    CredentialType credType     // 凭证类型
) external returns (uint256 tokenId);
```

**执行逻辑**：
1. `require(!nullifiers[nullifier], "Already minted")`
2. 构造 journal：`abi.encodePacked(msg.sender, nullifier, uint8(credType))`
3. 调用 `verifier.verify(seal, imageId, sha256(journal))`
4. `nullifiers[nullifier] = true`
5. `_mint(msg.sender, tokenId)`
6. 记录凭证信息

### 6.2 查询

```solidity
// 查询用户所有凭证
function getCredentials(address user) external view 
    returns (Credential[] memory);

// 检查用户是否拥有某类型凭证
function hasCredentialType(address user, CredentialType credType) 
    external view returns (bool);

// 查询单个 Token
function getCredential(uint256 tokenId) external view 
    returns (Credential memory);
```

### 6.3 管理函数（Owner Only）

```solidity
// 更新 Image ID（升级 Guest 程序时）
function setImageId(bytes32 newImageId) external onlyOwner;

// 更新 Verifier 地址
function setVerifier(address newVerifier) external onlyOwner;
```

---

## 7. 事件

```solidity
event Minted(
    address indexed recipient,
    uint256 indexed tokenId,
    bytes32 indexed nullifier,
    CredentialType credType
);

event ImageIdUpdated(bytes32 oldId, bytes32 newId);
event VerifierUpdated(address oldVerifier, address newVerifier);
```

---

## 8. SBT 特性（禁止转账）

```solidity
function _update(address to, uint256 tokenId, address auth) 
    internal override returns (address) 
{
    address from = _ownerOf(tokenId);
    require(from == address(0) || to == address(0), "SBT: non-transferable");
    return super._update(to, tokenId, auth);
}
```

---

## 9. NFT 元数据与图片设计

### 9.1 tokenURI 实现

合约需实现 `tokenURI()` 函数，根据凭证类型返回不同的元数据：

```solidity
function tokenURI(uint256 tokenId) public view override returns (string memory) {
    require(_exists(tokenId), "Token does not exist");
    
    Credential memory cred = credentials[tokenId];
    string memory baseURI = _baseTokenURI;
    
    // 根据凭证类型返回不同元数据
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

// 管理员可更新 baseURI
function setBaseTokenURI(string calldata newBaseURI) external onlyOwner;
```

### 9.2 元数据 JSON 格式（ERC721 Metadata 标准）

每种凭证类型需准备一个 JSON 文件：

**示例：`github.json`**
```json
{
  "name": "GhostLink GitHub Credential",
  "description": "Verified GitHub identity via zero-knowledge proof. This SBT proves the holder owns a GitHub account without revealing the account details.",
  "image": "ipfs://QmXxx.../github-badge.png",
  "external_url": "https://ghostlink.io",
  "attributes": [
    { "trait_type": "Credential Type", "value": "GitHub" },
    { "trait_type": "Verification Method", "value": "Zero-Knowledge Proof" },
    { "trait_type": "Transferable", "value": "No" }
  ]
}
```

### 9.3 图片设计要求

| 凭证类型 | 图片文件名 | 设计建议 |
|----------|------------|----------|
| GitHub | `github-badge.png` | 深色背景 + GitHub Logo + "Verified" 徽章 |
| Alipay | `alipay-badge.png` | 蓝色渐变 + 支付宝 Logo + 资产图标 |
| Twitter | `twitter-badge.png` | 蓝色背景 + Twitter/X Logo + 验证标记 |
| Wallet | `wallet-badge.png` | 紫色渐变 + 钱包图标 + 链上标记 |

**规格要求**：
- 尺寸：400×400px 或 1000×1000px（正方形）
- 格式：PNG（透明背景）或 SVG
- 风格：现代、简洁、专业

### 9.4 存储方案

| 方案 | 去中心化 | 成本 | 建议 |
|------|----------|------|------|
| IPFS | ✅ | 低 | ✅ 推荐（通过 Pinata/Infura） |
| Arweave | ✅ | 中 | 永久存储 |
| 链上 SVG | ✅ | 高 Gas | 完全去中心化 |
| 中心化服务器 | ❌ | 低 | 不推荐 |

### 9.5 状态变量补充

```solidity
string private _baseTokenURI;  // 如：ipfs://QmXxx.../
```

### 9.6 管理函数补充

```solidity
// 更新元数据 Base URI
function setBaseTokenURI(string calldata newBaseURI) external onlyOwner {
    _baseTokenURI = newBaseURI;
}
```

---

## 10. 依赖项

| 依赖 | 版本 | 说明 |
|------|------|------|
| OpenZeppelin | ^5.0.0 | ERC721, Ownable |
| RISC Zero Verifier | - | 由 RISC Zero 团队提供 |

---

## 11. 构造函数参数

```solidity
constructor(
    address _verifier,      // RISC Zero Verifier 地址
    bytes32 _imageId,       // Guest 程序 Image ID
    string memory _baseURI, // 元数据 Base URI
    string memory _name,    // "GhostLink Credential"
    string memory _symbol   // "GHOST"
)
```

---

## 12. 部署配置

### Sepolia 测试网

| 参数 | 值 |
|------|-----|
| Chain ID | 11155111 |
| Verifier | （待 RISC Zero 团队提供） |
| Image ID | （待 RISC Zero 团队提供） |
| Base URI | （待上传 IPFS 后填写） |

---

## 13. Gas 预估

| 操作 | 预估 Gas |
|------|----------|
| `mint` | ~350,000 |
| `getCredentials` | ~30,000 |
| `hasCredentialType` | ~5,000 |

---

## 14. 前端调用接口

```typescript
// ABI 接口
const CONTRACT_ABI = [
    "function mint(bytes calldata seal, bytes32 nullifier, uint8 credType) external returns (uint256)",
    "function getCredentials(address user) external view returns (tuple(uint8 credType, uint256 mintedAt, bytes32 nullifier)[])",
    "function hasCredentialType(address user, uint8 credType) external view returns (bool)",
    "function tokenURI(uint256 tokenId) external view returns (string)",
    "function imageId() external view returns (bytes32)",
    "function verifier() external view returns (address)",
    "function totalSupply() external view returns (uint256)",
    "function balanceOf(address owner) external view returns (uint256)",
    "function ownerOf(uint256 tokenId) external view returns (address)",
    "event Minted(address indexed recipient, uint256 indexed tokenId, bytes32 indexed nullifier, uint8 credType)"
];
```

---

## 15. 交付物

合约团队需交付：

| 交付物 | 说明 |
|--------|------|
| 合约源码 | 按上述规范实现 |
| 部署脚本 | Foundry / Hardhat 部署脚本 |
| 测试用例 | 单元测试覆盖核心功能 |
| 合约地址 | Sepolia 部署地址 |
| 验证合约 | Etherscan 验证 |
| **NFT 图片** | 4 种凭证类型的徽章图片 |
| **元数据 JSON** | 4 个 JSON 文件（上传到 IPFS） |

---

## 16. 联系方式

**GhostLink 技术团队**  
如有疑问请联系 [待填写]
