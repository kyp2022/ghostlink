package org.example.ghostlink.model;

import java.util.Map;

public class ZkProof {
    private String proofId;
    private boolean verified;
    private long timestamp;
    private Map<String, Object> data;

    public ZkProof(String proofId, boolean verified, long timestamp, Map<String, Object> data) {
        this.proofId = proofId;
        this.verified = verified;
        this.timestamp = timestamp;
        this.data = data;
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

    public Map<String, Object> getData() {
        return data;
    }

    public void setData(Map<String, Object> data) {
        this.data = data;
    }
}
