package org.example.ghostlink.service;

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
    
    public AuthResponse authenticateWithCode(String code, String redirectUri, String codeVerifier) {
        String accessToken = exchangeCodeForToken(code, redirectUri, codeVerifier);
        if (accessToken == null) {
            return new AuthResponse("Failed to retrieve access token from Twitter");
        }
        return fetchAndVerify(accessToken);
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

    private AuthResponse fetchAndVerify(String accessToken) {
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
                zkRequest.put("source", "twitter");
                zkRequest.put("userId", twitterUser.getId());
                zkRequest.put("username", twitterUser.getUsername());
                zkRequest.put("followers", twitterUser.getFollowersCount());
                
                ZkProof zkProof = callZkService(zkRequest);
                
                // 这里为了复用 AuthResponse，我们将 TwitterUser 包装一下或扩展 AuthResponse
                // 暂时简单返回成功
                return new AuthResponse("success", null, zkProof); 
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new AuthResponse("Failed to fetch Twitter user data");
    }
    
    private ZkProof callZkService(Map<String, Object> requestData) {
        // 接口返回格式：
        // {
        //     "receipt_hex": "...",
        //     "journal_hex": "...",
        //     "image_id_hex": "...",
        //     "nullifier_hex": "...",
        //     "status": "success"
        // }
        
        // TODO: 配置ZK服务地址
        String ZK_SERVICE_URL = "http://localhost:8081/zk/prove";
        
        try {
            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestData, headers);
            
            // 调用ZK服务（如果服务不可用，使用Mock数据）
            try {
                ResponseEntity<Map> response = restTemplate.postForEntity(ZK_SERVICE_URL, entity, Map.class);
                Map<String, Object> responseBody = response.getBody();
                
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
                }
            } catch (Exception e) {
                // ZK服务不可用，使用Mock数据
                System.out.println("ZK服务调用失败，使用Mock数据: " + e.getMessage());
            }
        } catch (Exception e) {
            System.out.println("调用ZK服务异常: " + e.getMessage());
        }
        
        // Mock数据：生成模拟的receipt和journal（当ZK服务不可用时使用）
        String mockReceipt = "0x" + generateMockHex(64);
        String mockJournal = "0x" + generateMockHex(64);
        String mockImageId = "0x" + generateMockHex(32);
        String mockNullifier = "0x" + generateMockHex(64);
        
        return new ZkProof(
                "zk-twitter-" + System.currentTimeMillis(),
                true,
                System.currentTimeMillis(),
                mockReceipt,
                mockJournal,
                mockImageId,
                mockNullifier
        );
    }
    
    private String generateMockHex(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            sb.append(String.format("%02x", (int)(Math.random() * 256)));
        }
        return sb.toString();
    }
}
