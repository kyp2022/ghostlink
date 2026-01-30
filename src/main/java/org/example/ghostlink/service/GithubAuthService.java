package org.example.ghostlink.service;

import com.fasterxml.jackson.databind.ObjectMapper;
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

    private static final String CLIENT_ID = "Iv23li88rvwnNxTsjlfc";
    private static final String CLIENT_SECRET = "addde702bf5e40b829d8ea079a29c402188446d0";
    
    private static final String GITHUB_ACCESS_TOKEN_URL = "https://github.com/login/oauth/access_token";
    private static final String GITHUB_USER_API = "https://api.github.com/user";
    
    // ZK 服务地址 - 符合 RISC Zero 规范
    private static final String ZK_SERVICE_URL = "http://localhost:8081/api/v1/receipt-data";

    /**
     * 处理 OAuth 回调逻辑：Code -> Token -> User -> ZK Proof
     */
    public AuthResponse authenticateWithCode(String code, String recipient) {
        // 1. 用 Code 换取 Access Token
        String accessToken = exchangeCodeForToken(code);
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
            // 增加超时时间设置，因为ZK证明生成可能需要较长时间（如10分钟）
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(60000); // 连接超时 60秒
            factory.setReadTimeout(600000);   // 读取超时 600秒 (10分钟)
            
            RestTemplate restTemplate = new RestTemplate(factory);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
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
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(request, headers);
            
            ObjectMapper objectMapper = new ObjectMapper();
            System.out.println("开始调用ZK服务 (GitHub)，这可能需要几分钟...");
            System.out.println("请求数据: " + objectMapper.writeValueAsString(request));
            
            ResponseEntity<Map> response = restTemplate.postForEntity(ZK_SERVICE_URL, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            
            // 打印完整的响应体到控制台
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
