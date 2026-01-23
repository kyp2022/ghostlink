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
                
                // 模拟 ZK 证明
                ZkProof zkProof = new ZkProof(
                    "zk-twitter-" + System.currentTimeMillis(),
                    true,
                    System.currentTimeMillis(),
                    Map.of("source", "twitter", "followers", twitterUser.getFollowersCount())
                );
                
                // 这里为了复用 AuthResponse，我们将 TwitterUser 包装一下或扩展 AuthResponse
                // 暂时简单返回成功
                return new AuthResponse("success", null, zkProof); 
            }
        } catch (Exception e) {
            e.printStackTrace();
        }
        return new AuthResponse("Failed to fetch Twitter user data");
    }
}
