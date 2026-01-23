package org.example.ghostlink.model;

import java.util.Map;

public class GithubUser {
    private Long id;
    private String login;
    private String createdAt;
    private Integer followers;

    public GithubUser() {}

    public GithubUser(Map<String, Object> data) {
        this.id = ((Number) data.get("id")).longValue();
        this.login = (String) data.get("login");
        this.createdAt = (String) data.get("created_at");
        this.followers = (Integer) data.get("followers");
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getLogin() {
        return login;
    }

    public void setLogin(String login) {
        this.login = login;
    }

    public String getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(String createdAt) {
        this.createdAt = createdAt;
    }

    public Integer getFollowers() {
        return followers;
    }

    public void setFollowers(Integer followers) {
        this.followers = followers;
    }
}
