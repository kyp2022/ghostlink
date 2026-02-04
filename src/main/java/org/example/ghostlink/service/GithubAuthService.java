package org.example.ghostlink.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.ghostlink.model.AuthResponse;
import org.example.ghostlink.model.GithubUser;
import org.example.ghostlink.model.ZkProof;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

@Service
public class GithubAuthService {

    private static final String GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_API = "https://api.github.com/user";

    private final String clientId;
    private final String clientSecret;
    private final ZkProofService zkProofService;

    @Autowired
    public GithubAuthService(
            @Value("${ghostlink.github.client-id}") String clientId,
            @Value("${ghostlink.github.client-secret}") String clientSecret,
            ZkProofService zkProofService
    ) {
        this.clientId = clientId;
        this.clientSecret = clientSecret;
        this.zkProofService = zkProofService;
        System.out.println("DEBUG: GithubAuthService initialized with ClientID: " + 
            (clientId != null && clientId.length() > 4 ? clientId.substring(0, 4) + "****" : "null/empty"));
    }

    /**
     * 处理 OAuth 回调逻辑：Code -> Token -> User -> ZK Proof
     */
    public AuthResponse authenticateWithCode(String code, String recipient, String redirectUri) {
        if (clientId == null || clientId.isBlank() || clientSecret == null || clientSecret.isBlank()) {
            return new AuthResponse("GitHub OAuth 配置缺失：请设置 GHOSTLINK_GITHUB_CLIENT_ID / GHOSTLINK_GITHUB_CLIENT_SECRET");
        }
        // 1. 用 Code 换取 Access Token
        String accessToken = exchangeCodeForToken(code, redirectUri);
        if (accessToken == null) {
            return new AuthResponse("Failed to retrieve access token from GitHub");
        }

        // 2. 继续原有的验证流程
        return authenticate(accessToken, recipient);
    }

    public AuthResponse authenticate(String accessToken, String recipient) {
        if (accessToken == null || accessToken.isEmpty()) {
            return new AuthResponse("Access Token is required");
        }

        // 1. 获取 GitHub 用户信息
        Map<String, Object> githubUserData = fetchGithubUser(accessToken);
        if (githubUserData == null || githubUserData.containsKey("error")) {
            return new AuthResponse("Invalid GitHub Token");
        }
        
        GithubUser githubUser = new GithubUser(githubUserData);

        // 2. 调用 ZK 服务生成证明
        ZkProof zkProof = callZkService(githubUserData, recipient);

        // 3. 返回结果
        if (zkProof != null && zkProof.isVerified()) {
            return new AuthResponse("success", githubUser, zkProof);
        } else {
            return new AuthResponse("ZK Proof generation failed", githubUser, null);
        }
    }

    private String exchangeCodeForToken(String code, String redirectUri) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("Accept", "application/json");

        Map<String, String> body = new HashMap<>();
        body.put("client_id", clientId);
        body.put("client_secret", clientSecret);
        body.put("code", code);
        if (redirectUri != null && !redirectUri.isEmpty()) {
             body.put("redirect_uri", redirectUri);
        }

        HttpEntity<Map<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(GITHUB_ACCESS_TOKEN_URL, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("access_token")) {
                return (String) responseBody.get("access_token");
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            System.err.println("GitHub Token Exchange Failed: " + e.getStatusCode() + " " + e.getResponseBodyAsString());
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("GitHub Token Exchange Exception: " + e.getMessage());
            e.printStackTrace();
        }
        return null;
    }

    private Map<String, Object> fetchGithubUser(String accessToken) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<Void> entity = new HttpEntity<>(headers);

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

    /**
     * 调用 ZK 服务生成证明
     * 按照 risc_zero_spec.md 规范构造请求
     */
    private ZkProof callZkService(Map<String, Object> githubUserData, String recipient) {
        try {
            ObjectMapper objectMapper = new ObjectMapper();
            
            // 按照规范构造 data 对象
            Map<String, Object> data = new HashMap<>();
            data.put("user_id", githubUserData.get("id"));  // Number
            data.put("username", githubUserData.get("login"));  // String
            data.put("created_at", githubUserData.get("created_at"));  // String (ISO 8601)
            Object publicRepos = githubUserData.get("public_repos");
            data.put("public_repos", publicRepos != null ? publicRepos : 0);  // Number
            
            // 构造符合规范的请求体
            Map<String, Object> request = new HashMap<>();
            request.put("credential_type", "github");
            request.put("data", data);
            request.put("recipient", recipient != null ? recipient : "0x0000000000000000000000000000000000000000");

            // 直接调用本地服务生成证明 (Refactored to avoid self-HTTP call)
            System.out.println("开始调用ZK服务 (GitHub，本地调用)...");
            System.out.println("请求数据: " + objectMapper.writeValueAsString(request));
            
            // 调用本地 Service
            Map<String, String> responseBody = zkProofService.generateMockProof(request);
            
            // 打印响应 (Keeping existing logging structure)
            System.out.println("ZK服务响应: " + objectMapper.writeValueAsString(responseBody));
            
            if (responseBody != null && "success".equals(responseBody.get("status"))) {
                // 解析真实接口返回的数据
                String receiptHex = (String) responseBody.get("receipt_hex");
                String journalHex = (String) responseBody.get("journal_hex");
                String imageIdHex = (String) responseBody.get("image_id_hex");
                String nullifierHex = (String) responseBody.get("nullifier_hex");
                
                // 确保添加0x前缀（如果接口返回的没有）
                String receipt = receiptHex != null && !receiptHex.startsWith("0x") ? "0x" + receiptHex : receiptHex;
                String journal = journalHex != null && !journalHex.startsWith("0x") ? "0x" + journalHex : journalHex;
                String imageId = imageIdHex != null && !imageIdHex.startsWith("0x") ? "0x" + imageIdHex : imageIdHex;
                String nullifier = nullifierHex != null && !nullifierHex.startsWith("0x") ? "0x" + nullifierHex : nullifierHex;
                
                return new ZkProof(
                        "zk-github-" + System.currentTimeMillis(),
                        true,
                        System.currentTimeMillis(),
                        receipt,
                        journal,
                        imageId,
                        nullifier
                );
            } else {
                // 处理错误响应
                String errorCode = (String) responseBody.get("error_code");
                String errorMessage = (String) responseBody.get("message");
                System.out.println("ZK服务返回错误 - Code: " + errorCode + ", Message: " + errorMessage);
            }
        } catch (Exception e) {
            System.out.println("调用ZK服务异常: " + e.getMessage());
            e.printStackTrace();
        }
        
        // 如果调用失败，返回验证失败的对象
        return new ZkProof(
                "zk-fail-" + System.currentTimeMillis(),
                false,
                System.currentTimeMillis(),
                null, null, null, null
        );
    }
}
