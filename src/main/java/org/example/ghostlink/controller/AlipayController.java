package org.example.ghostlink.controller;

import org.example.ghostlink.model.ZkProof;
import org.example.ghostlink.service.AlipayService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/assets")
@CrossOrigin(origins = "http://localhost:5174")
public class AlipayController {

    @Autowired
    private AlipayService alipayService;

    @PostMapping("/upload/alipay")
    public ResponseEntity<?> uploadAssetProof(
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "recipient", required = false) String recipient,
            @RequestParam(value = "threshold", required = false) String threshold) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Check if we should only verify or verify and generate proof
            // Default to true if recipient is provided, false otherwise (or checks explicit param)
            boolean generateProof = recipient != null && !recipient.isEmpty();

            if (!generateProof) {
                // Only verify and extract data
                Map<String, String> results = alipayService.verifyAndExtractBalance(file);
                
                Map<String, Object> response = new HashMap<>();
                response.put("status", "success");
                response.put("verified", true);
                response.put("provider", "alipay");
                response.put("asset_amount", results.get("balance"));
                response.put("id_number", results.get("idNumber"));
                response.put("id_number_hash", results.get("id_number_hash"));
                response.put("message", "Asset Proof Verified Successfully. Ready for ZK Proof Generation.");
                return ResponseEntity.ok(response);
            }

            // 验证、提取数据并生成 ZK 证明
            ZkProof zkProof = alipayService.verifyAndGenerateProof(file, recipient, threshold);

            // 返回成功响应，包含 ZK 证明数据
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("verified", zkProof.isVerified());
            response.put("provider", "alipay");
            
            // 添加 ZK 证明数据
            if (zkProof.isVerified()) {
                response.put("zkProof", Map.of(
                    "proofId", zkProof.getProofId(),
                    "receipt", zkProof.getReceipt(),
                    "journal", zkProof.getJournal(),
                    "imageId", zkProof.getImageId(),
                    "nullifier", zkProof.getNullifier(),
                    "timestamp", zkProof.getTimestamp()
                ));
                response.put("message", "Asset Proof Verified and ZK Proof Generated Successfully");
            } else {
                response.put("message", "Asset Proof Verified but ZK Proof Generation Failed");
            }

            return ResponseEntity.ok(response);

        } catch (SecurityException e) {
            return ResponseEntity.status(403).body(Map.of("status", "error", "message", e.getMessage()));
        } catch (IOException e) {
            return ResponseEntity.status(500).body(Map.of("status", "error", "message", "Failed to parse PDF file"));
        } catch (Exception e) {
            return ResponseEntity.status(400).body(Map.of("status", "error", "message", e.getMessage()));
        }
    }
}
