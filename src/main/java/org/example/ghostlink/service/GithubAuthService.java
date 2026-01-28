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
    
    // ZK 服务地址
    private static final String ZK_SERVICE_URL = "http://127.0.0.1:3000/prove";

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

        // 2. 构造发送给 ZK 服务的请求数据
        // 必须严格遵循 GhostLink_Integration_Guide.md 中的 input_json 结构要求
        Map<String, Object> zkRequest = new HashMap<>();
        zkRequest.put("id", githubUser.getId());          // Number
        zkRequest.put("login", githubUser.getLogin());    // String
        zkRequest.put("created_at", githubUser.getCreatedAt()); // String (ISO 8601)
        // 注意：GitHub API 返回的是 public_repos，但我们的 GithubUser 模型中可能没有这个字段
        // 如果 GithubUser 模型中没有，我们需要从原始 map 中获取
        Object publicRepos = githubUserData.get("public_repos");
        zkRequest.put("public_repos", publicRepos != null ? publicRepos : 0); // Number

        // 3. 调用 ZK 服务
        ZkProof zkProof = callZkService(zkRequest, recipient);

        // 4. 返回结果
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

    private ZkProof callZkService(Map<String, Object> requestData, String recipient) {
        try {
            // 增加超时时间设置，因为ZK证明生成可能需要较长时间（如10分钟）
            org.springframework.http.client.SimpleClientHttpRequestFactory factory = new org.springframework.http.client.SimpleClientHttpRequestFactory();
            factory.setConnectTimeout(60000); // 连接超时 60秒
            factory.setReadTimeout(600000);   // 读取超时 600秒 (10分钟)
            
            RestTemplate restTemplate = new RestTemplate(factory);
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            // 将请求数据包装在 input_json 字段中，并序列化为 JSON 字符串
            ObjectMapper objectMapper = new ObjectMapper();
            String jsonString = objectMapper.writeValueAsString(requestData);
            
            Map<String, Object> wrappedRequest = new HashMap<>();
            wrappedRequest.put("input_json", jsonString);
            // recipient 是必填项
            wrappedRequest.put("recipient", recipient != null ? recipient : "0x0000000000000000000000000000000000000000");
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(wrappedRequest, headers);
            
            System.out.println("开始调用ZK服务，这可能需要几分钟...");
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
                // 注意：调用指导.md 指出接口返回的 hex 不带 0x 前缀，但前端和合约需要 0x 前缀
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
                System.out.println("ZK服务返回状态非success: " + responseBody);
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
