package org.example.ghostlink.controller;

import org.example.ghostlink.model.AuthResponse;
import org.example.ghostlink.service.GithubAuthService;
import org.example.ghostlink.service.TwitterAuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@CrossOrigin(originPatterns = "*", allowCredentials = "true")
public class AuthController {

    private final GithubAuthService githubAuthService;
    private final TwitterAuthService twitterAuthService;

    @Autowired
    public AuthController(GithubAuthService githubAuthService, TwitterAuthService twitterAuthService) {
        this.githubAuthService = githubAuthService;
        this.twitterAuthService = twitterAuthService;
    }

    @PostMapping("/github/callback")
    public ResponseEntity<AuthResponse> githubCallback(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String recipient = payload.get("recipient"); // 获取前端传递的 recipient
        String redirectUri = payload.get("redirectUri");
        
        AuthResponse response = githubAuthService.authenticateWithCode(code, recipient, redirectUri);
        if (response.getError() != null) return ResponseEntity.status(401).body(response);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/twitter/callback")
    public ResponseEntity<AuthResponse> twitterCallback(@RequestBody Map<String, String> payload) {
        String code = payload.get("code");
        String redirectUri = payload.get("redirectUri");
        String codeVerifier = payload.get("codeVerifier");
        String recipient = payload.get("recipient"); // 获取前端传递的 recipient
        
        AuthResponse response = twitterAuthService.authenticateWithCode(code, redirectUri, codeVerifier, recipient);
        if (response.getError() != null) return ResponseEntity.status(401).body(response);
        return ResponseEntity.ok(response);
    }
}
