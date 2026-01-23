package org.example.ghostlink.model;

public class AuthResponse {
    private String status;
    private GithubUser user;
    private ZkProof zkProof;
    private String error;

    public AuthResponse(String status, GithubUser user, ZkProof zkProof) {
        this.status = status;
        this.user = user;
        this.zkProof = zkProof;
    }

    public AuthResponse(String error) {
        this.error = error;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public GithubUser getUser() {
        return user;
    }

    public void setUser(GithubUser user) {
        this.user = user;
    }

    public ZkProof getZkProof() {
        return zkProof;
    }

    public void setZkProof(ZkProof zkProof) {
        this.zkProof = zkProof;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }
}
