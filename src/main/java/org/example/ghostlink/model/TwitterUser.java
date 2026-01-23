package org.example.ghostlink.model;

import java.util.Map;

public class TwitterUser {
    private String id;
    private String username;
    private String createdAt;
    private Integer followersCount;

    public TwitterUser() {}

    @SuppressWarnings("unchecked")
    public TwitterUser(Map<String, Object> data) {
        this.id = (String) data.get("id");
        this.username = (String) data.get("username");
        this.createdAt = (String) data.get("created_at");
        
        Map<String, Object> metrics = (Map<String, Object>) data.get("public_metrics");
        if (metrics != null) {
            this.followersCount = (Integer) metrics.get("followers_count");
        }
    }

    // Getters and Setters
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }
    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
    public Integer getFollowersCount() { return followersCount; }
    public void setFollowersCount(Integer followersCount) { this.followersCount = followersCount; }
}
