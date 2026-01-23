package org.example.ghostlink.service;

import org.example.ghostlink.model.AuthResponse;
import org.example.ghostlink.model.GithubUser;
import org.example.ghostlink.model.ZkProof;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class GithubAuthService {

    // TODO: 请替换为您在 GitHub 注册的 OAuth App 的 Client ID 和 Secret
    private static final String CLIENT_ID = "Iv23li88rvwnNxTsjlfc";
    private static final String CLIENT_SECRET = "addde702bf5e40b829d8ea079a29c402188446d0";
    
    private static final String GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_API = "https://api.github.com/user";
    
    // 模拟 ZK 服务地址
    private static final String ZK_SERVICE_URL = "http://localhost:8081/zk/prove";

    /**
     * 处理 OAuth 回调逻辑：Code -> Token -> User -> ZK Proof
     */
    public AuthResponse authenticateWithCode(String code) {
        // 1. 用 Code 换取 Access Token
        String accessToken = exchangeCodeForToken(code);
        if (accessToken == null) {
            return new AuthResponse("Failed to retrieve access token from GitHub");
        }

        // 2. 继续原有的验证流程
        return authenticate(accessToken);
    }

    public AuthResponse authenticate(String accessToken) {
        if (accessToken == null || accessToken.isEmpty()) {
            return new AuthResponse("Access Token is required");
        }

        // 1. 获取 GitHub 用户信息
        Map<String, Object> githubUserData = fetchGithubUser(accessToken);
        if (githubUserData == null || githubUserData.containsKey("error")) {
            return new AuthResponse("Invalid GitHub Token");
        }
        
        GithubUser githubUser = new GithubUser(githubUserData);

        // 2. 构造发送给 ZK 服务的请求数据
        Map<String, Object> zkRequest = new HashMap<>();
        zkRequest.put("source", "github");
        zkRequest.put("userId", githubUser.getId());
        zkRequest.put("username", githubUser.getLogin());
        zkRequest.put("createdAt", githubUser.getCreatedAt());
        zkRequest.put("followers", githubUser.getFollowers());

        // 3. 调用 ZK 服务 (Mock)
        ZkProof zkProof = callZkService(zkRequest);

        // 4. 返回结果
        return new AuthResponse("success", githubUser, zkProof);
    }

    private String exchangeCodeForToken(String code) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        Map<String, String> body = new HashMap<>();
        body.put("client_id", CLIENT_ID);
        body.put("client_secret", CLIENT_SECRET);
        body.put("code", code);

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GITHUB_ACCESS_TOKEN_URL, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("access_token")) {
                return (String) responseBody.get("access_token");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private Map<String, Object> fetchGithubUser(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>("parameters", headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(
                    GITHUB_USER_API,
                    HttpMethod.GET,
                    entity,
                    Map.class
            );
            return response.getBody();
        } catch (Exception e) {
            e.printStackTrace();
            return Map.of("error", e.getMessage());
        }
    }

    private ZkProof callZkService(Map<String, Object> requestData) {
        // Mock Response
        return new ZkProof(
                "zk-" + System.currentTimeMillis(),
                true,
                System.currentTimeMillis(),
                requestData
        );
    }
}
