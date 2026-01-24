# 钱包连接和链上调用配置说明

## 概述

本项目已集成钱包连接（MetaMask）和智能合约调用功能，可以将零知识证明数据上链铸造凭证。

## 配置步骤

### 1. 合约地址配置

合约已部署在以太坊测试网，地址为：
```
0x9400bd507276582aA9f33fd84B836FD4b30fed39
```

### 2. 网络配置

在 `web/index.html` 中配置正确的测试网信息：

```javascript
const CHAIN_ID = 11155111; // Sepolia测试网
// 或根据实际部署的网络修改：
// - Goerli: 5
// - Sepolia: 11155111
// - 其他测试网: 查看对应网络的Chain ID
```

### 3. 合约ABI配置

根据实际部署的合约接口，修改 `web/index.html` 中的 `CONTRACT_ABI`：

```javascript
const CONTRACT_ABI = [
    "function verifyAndMint(bytes calldata receipt, bytes32 journal, uint8 credentialType) external",
    // 添加其他需要的函数和事件
];
```

**重要**：如果实际合约接口参数不同，需要：
1. 修改 `CONTRACT_ABI` 中的函数签名
2. 修改 `useContract` hook 中 `mintCredential` 函数的调用方式
3. 参考 `contract-call-example.js` 中的示例

### 4. 零知识证明数据结构

后端返回的 `ZkProof` 对象应包含以下字段：

```json
{
    "proofId": "zk-github-1234567890",
    "verified": true,
    "timestamp": 1234567890,
    "receipt": "0x...",      // bytes格式的receipt（十六进制字符串）
    "journal": "0x...",      // bytes32格式的journal（64个hex字符，带0x前缀）
    "imageId": "0x...",      // Image ID（可选）
    "nullifier": "0x..."     // Nullifier（可选）
}
```

### 5. 参数适配说明

如果实际合约接口参数与当前实现不同，请按以下步骤调整：

#### 情况1：参数顺序不同
```javascript
// 当前：verifyAndMint(receipt, journal, credentialType)
// 如果实际是：verifyAndMint(credentialType, journal, receipt)
const tx = await contract.verifyAndMint(credType, journal, receipt);
```

#### 情况2：需要额外参数（如imageId）
```javascript
// 修改ABI
const CONTRACT_ABI = [
    "function verifyAndMint(bytes calldata receipt, bytes32 journal, bytes32 imageId, uint8 credentialType) external"
];

// 修改调用
const tx = await contract.verifyAndMint(receipt, journal, zkProof.imageId, credType);
```

#### 情况3：使用结构体参数
```javascript
// 修改ABI
const CONTRACT_ABI = [
    "function verifyAndMint((bytes receipt, bytes32 journal, bytes32 imageId) proof, uint8 credentialType) external"
];

// 修改调用
const proof = {
    receipt: receipt,
    journal: journal,
    imageId: zkProof.imageId
};
const tx = await contract.verifyAndMint(proof, credType);
```

## 使用流程

1. **连接钱包**：点击页面右上角的 "Connect Wallet" 按钮
2. **授权MetaMask**：在MetaMask弹窗中确认连接
3. **切换网络**：如果当前网络不正确，系统会自动提示切换
4. **验证身份**：连接GitHub或Twitter账号
5. **上链铸造**：验证成功后，点击 "上链铸造凭证" 按钮
6. **确认交易**：在MetaMask中确认交易
7. **查看结果**：交易确认后，凭证已成功铸造

## 测试

1. 确保已安装MetaMask浏览器扩展
2. 确保MetaMask连接到正确的测试网
3. 确保测试账户有足够的测试ETH支付Gas费用
4. 测试GitHub和Twitter的验证和上链流程

## 故障排除

### 问题1：无法连接钱包
- 检查是否安装了MetaMask
- 检查浏览器是否允许MetaMask扩展运行

### 问题2：交易失败
- 检查网络是否正确
- 检查账户是否有足够的ETH支付Gas
- 检查合约地址是否正确
- 检查合约ABI是否匹配实际合约接口

### 问题3：参数格式错误
- 检查receipt和journal的数据格式
- receipt应该是bytes格式（任意长度的十六进制字符串）
- journal应该是bytes32格式（64个hex字符，带0x前缀）

## 参考文件

- `demo/contract-call-example.js` - 合约调用示例代码
- `web/index.html` - 前端实现代码
- `src/main/java/org/example/ghostlink/model/ZkProof.java` - 后端数据模型
