package org.example.ghostlink.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.example.ghostlink.model.AuthResponse;
import org.example.ghostlink.model.TwitterUser;
import org.example.ghostlink.model.ZkProof;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.beans.factory.annotation.Autowired;

import java.util.HashMap;
import java.util.Map;

@Service
public class TwitterAuthService {

    private static final String CLIENT_ID = "Y2ZMMWgzOGNNYjdISDhVZ1BHNjc6MTpjaQ";
    private static final String CLIENT_SECRET = "77Qg1qfdoG_n47-tkmZoRZY_WMQNIqibANyk5rMkpramUqjB4s";
    
    private static final String TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
    private static final String TWITTER_USER_API = "https://api.twitter.com/2/users/me?user.fields=created_at,public_metrics";
    
    @Autowired
    private ZkProofService zkProofService;

    public AuthResponse authenticateWithCode(String code, String redirectUri, String codeVerifier, String recipient) {
        String accessToken = exchangeCodeForToken(code, redirectUri, codeVerifier);
        if (accessToken == null) {
            return new AuthResponse("Failed to retrieve access token from Twitter");
        }
        return fetchAndVerify(accessToken, recipient);
    }

    private String exchangeCodeForToken(String code, String redirectUri, String codeVerifier) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setBasicAuth(CLIENT_ID, CLIENT_SECRET);

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("code", code);
        body.add("grant_type", "authorization_code");
        body.add("client_id", CLIENT_ID);
        body.add("redirect_uri", redirectUri);
        body.add("code_verifier", codeVerifier); // Twitter OAuth 2.0 PKCE 必须

        HttpEntity<MultiValueMap<String, String>> entity = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(TWITTER_TOKEN_URL, entity, Map.class);
            Map<String, Object> responseBody = response.getBody();
            if (responseBody != null && responseBody.containsKey("access_token")) {
                return (String) responseBody.get("access_token");
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return null;
    }

    private AuthResponse fetchAndVerify(String accessToken, String recipient) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(accessToken);
        HttpEntity<String> entity = new HttpEntity<>(headers);

        try {
            ResponseEntity<Map> response = restTemplate.exchange(TWITTER_USER_API, HttpMethod.GET, entity, Map.class);
            Map<String, Object> body = response.getBody();
            if (body != null && body.containsKey("data")) {
                Map<String, Object> userData = (Map<String, Object>) body.get("data");
                TwitterUser twitterUser = new TwitterUser(userData);
                
                // 调用ZK服务生成证明
                ZkProof zkProof = callZkService(userData, recipient);
                
                if (zkProof != null && zkProof.isVerified()) {
                    return new AuthResponse("success", null, zkProof);
                } else {
                    return new AuthResponse("ZK Proof generation failed", null, null);
                }
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new AuthResponse("Failed to fetch Twitter user data");
    }
    
    /**
     * 调用 ZK 服务生成证明
     * 按照 risc_zero_spec.md 规范构造请求
     */
    private ZkProof callZkService(Map<String, Object> twitterUserData, String recipient) {
        try {
            // 按照规范构造 data 对象
            Map<String, Object> data = new HashMap<>();
            data.put("user_id", twitterUserData.get("id"));  // String
            data.put("handle", twitterUserData.get("username"));  // String (不含 @)
            data.put("created_at", twitterUserData.get("created_at"));  // String (ISO 8601)
            
            // 获取粉丝数（可选字段）
            Map<String, Object> publicMetrics = (Map<String, Object>) twitterUserData.get("public_metrics");
            if (publicMetrics != null && publicMetrics.containsKey("followers_count")) {
                data.put("followers_count", publicMetrics.get("followers_count"));  // Number
            } else {
                data.put("followers_count", 0);
            }
            
            // 构造符合规范的请求体
            Map<String, Object> request = new HashMap<>();
            request.put("credential_type", "twitter");
            request.put("data", data);
            request.put("recipient", recipient != null ? recipient : "0x0000000000000000000000000000000000000000");

            ObjectMapper objectMapper = new ObjectMapper();
            System.out.println("开始调用ZK服务 (Twitter，本地调用)...");
            System.out.println("请求数据: " + objectMapper.writeValueAsString(request));
            
            // 直接调用本地服务生成证明 (Refactored to avoid self-HTTP call)
            Map<String, String> responseBody = zkProofService.generateMockProof(request);
            
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
                        "zk-twitter-" + System.currentTimeMillis(),
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
