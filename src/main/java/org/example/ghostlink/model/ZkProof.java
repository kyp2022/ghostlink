package org.example.ghostlink.model;

import java.util.Map;

/**
 * ZkProof 零知识证明数据模型
 * 适配RISC Zero零知识证明的数据结构
 * @author kuangyp
 * @version 2025-01-27
 */
public class ZkProof {
    private String proofId;
    private boolean verified;
    private long timestamp;
    
    // RISC Zero 证明数据
    private String receipt;      // Receipt的十六进制字符串（bytes）
    private String journal;      // Journal的十六进制字符串（bytes32）
    private String imageId;      // Image ID（用于验证）
    private String nullifier;    // Nullifier（防止双花）
    
    // 原始数据（用于调试，可选）
    private Map<String, Object> data;

    public ZkProof() {
    }

    public ZkProof(String proofId, boolean verified, long timestamp, Map<String, Object> data) {
        this.proofId = proofId;
        this.verified = verified;
        this.timestamp = timestamp;
        this.data = data;
    }

    public ZkProof(String proofId, boolean verified, long timestamp, String receipt, String journal, String imageId, String nullifier) {
        this.proofId = proofId;
        this.verified = verified;
        this.timestamp = timestamp;
        this.receipt = receipt;
        this.journal = journal;
        this.imageId = imageId;
        this.nullifier = nullifier;
    }

    public String getProofId() {
        return proofId;
    }

    public void setProofId(String proofId) {
        this.proofId = proofId;
    }

    public boolean isVerified() {
        return verified;
    }

    public void setVerified(boolean verified) {
        this.verified = verified;
    }

    public long getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(long timestamp) {
        this.timestamp = timestamp;
    }

    public String getReceipt() {
        return receipt;
    }

    public void setReceipt(String receipt) {
        this.receipt = receipt;
    }

    public String getJournal() {
        return journal;
    }

    public void setJournal(String journal) {
        this.journal = journal;
    }

    public String getImageId() {
        return imageId;
    }

    public void setImageId(String imageId) {
        this.imageId = imageId;
    }

    public String getNullifier() {
        return nullifier;
    }

    public void setNullifier(String nullifier) {
        this.nullifier = nullifier;
    }

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
