package org.example.ghostlink.service;

import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.Map;

@Service
public class ZkProofService {

    private static final SecureRandom random = new SecureRandom();

    /**
     * Generate mock ZK proof data
     * (Formerly handled by ExampleController)
     */
    public Map<String, String> generateMockProof(Map<String, Object> requestData) {
        Map<String, String> response = new HashMap<>();
        
        // Set status
        response.put("status", "success");
        
        // Generate mock hex strings
        response.put("receipt_hex", generateRandomHexString(224)); // 112 bytes
        response.put("journal_hex", generateRandomHexString(98));  // 49 bytes
        response.put("image_id_hex", generateRandomHexString(64)); // 32 bytes
        response.put("nullifier_hex", generateRandomHexString(64)); // 32 bytes
        
        return response;
    }
    
    /**
     * Generate random hex string of specified length
     */
    private String generateRandomHexString(int length) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < length; i++) {
            int randomNum = random.nextInt(16);
            sb.append(Integer.toHexString(randomNum));
        }
        return sb.toString();
    }
}
