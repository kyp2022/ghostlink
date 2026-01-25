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

import java.util.HashMap;
import java.util.Map;

@Service
public class TwitterAuthService {

    private static final String CLIENT_ID = "Y2ZMMWgzOGNNYjdISDhVZ1BHNjc6MTpjaQ";
    private static final String CLIENT_SECRET = "77Qg1qfdoG_n47-tkmZoRZY_WMQNIqibANyk5rMkpramUqjB4s";
    
    private static final String TWITTER_TOKEN_URL = "https://api.twitter.com/2/oauth2/token";
    private static final String TWITTER_USER_API = "https://api.twitter.com/2/users/me?user.fields=created_at,public_metrics";
    
    // ZK 服务地址
    private static final String ZK_SERVICE_URL = "http://127.0.0.1:3000/prove";

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
                Map<String, Object> zkRequest = new HashMap<>();
                // Twitter 字段映射，假设 ZK 服务使用相同的字段名
                zkRequest.put("id", twitterUser.getId());          // userId -> id
                zkRequest.put("login", twitterUser.getUsername()); // username -> login (复用 login 字段)
                zkRequest.put("created_at", twitterUser.getCreatedAt()); // createdAt -> created_at
                zkRequest.put("followers", twitterUser.getFollowersCount());
                
                ZkProof zkProof = callZkService(zkRequest, recipient);
                
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
                        "zk-twitter-" + System.currentTimeMillis(),
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
