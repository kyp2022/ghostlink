/**
 * 合约调用示例
 * 根据实际合约接口调整参数格式
 * @author kuangyp
 * @version 2025-01-27
 */

// 合约地址
const CONTRACT_ADDRESS = "0x9400bd507276582aA9f33fd84B836FD4b30fed39";

// 示例1: 如果合约接口是 verifyAndMint(bytes receipt, bytes32 journal, uint8 credentialType)
async function callContractExample1(signer, zkProof) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        "function verifyAndMint(bytes calldata receipt, bytes32 journal, uint8 credentialType) external"
    ], signer);

    const receipt = ethers.utils.hexlify(zkProof.receipt);
    const journal = zkProof.journal; // 应该是bytes32格式
    const credentialType = 0; // 0: GitHub, 1: Twitter

    const tx = await contract.verifyAndMint(receipt, journal, credentialType);
    await tx.wait();
}

// 示例2: 如果合约接口需要额外的参数，比如 imageId
async function callContractExample2(signer, zkProof) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        "function verifyAndMint(bytes calldata receipt, bytes32 journal, bytes32 imageId, uint8 credentialType) external"
    ], signer);

    const receipt = ethers.utils.hexlify(zkProof.receipt);
    const journal = zkProof.journal;
    const imageId = zkProof.imageId; // 如果合约需要imageId
    const credentialType = 0;

    const tx = await contract.verifyAndMint(receipt, journal, imageId, credentialType);
    await tx.wait();
}

// 示例3: 如果合约接口参数顺序不同
async function callContractExample3(signer, zkProof) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        "function verifyAndMint(uint8 credentialType, bytes32 journal, bytes calldata receipt) external"
    ], signer);

    const credentialType = 0;
    const journal = zkProof.journal;
    const receipt = ethers.utils.hexlify(zkProof.receipt);

    const tx = await contract.verifyAndMint(credentialType, journal, receipt);
    await tx.wait();
}

// 示例4: 如果合约需要结构体参数
async function callContractExample4(signer, zkProof) {
    const contract = new ethers.Contract(CONTRACT_ADDRESS, [
        "function verifyAndMint((bytes receipt, bytes32 journal, bytes32 imageId) proof, uint8 credentialType) external"
    ], signer);

    const proof = {
        receipt: ethers.utils.hexlify(zkProof.receipt),
        journal: zkProof.journal,
        imageId: zkProof.imageId
    };
    const credentialType = 0;

    const tx = await contract.verifyAndMint(proof, credentialType);
    await tx.wait();
}

// 使用说明：
// 1. 根据实际部署的合约ABI，修改 CONTRACT_ABI 中的函数签名
// 2. 根据实际合约接口的参数顺序和类型，调整 mintCredential 函数中的参数
// 3. 确保 receipt 和 journal 的数据格式正确（bytes 和 bytes32）
// 4. 如果合约需要额外的验证参数（如 imageId, nullifier），从 zkProof 对象中获取
