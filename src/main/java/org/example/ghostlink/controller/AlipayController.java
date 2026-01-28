package org.example.ghostlink.controller;

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
@CrossOrigin(origins = "http://localhost:5173")
public class AlipayController {

    @Autowired
    private AlipayService alipayService;

    @PostMapping("/upload/alipay")
    public ResponseEntity<?> uploadAssetProof(@RequestParam("file") MultipartFile file) {
        try {
            if (file.isEmpty()) {
                return ResponseEntity.badRequest().body("Please select a file to upload");
            }

            // Verify and Extract
            Map<String, String> results = alipayService.verifyAndExtractBalance(file);

            // Return success response with extracted data
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("verified", true);
            response.put("provider", "alipay");
            response.put("asset_amount", results.get("balance"));
            response.put("id_number", results.get("idNumber"));
            response.put("message", "Asset Proof Verified Successfully via Digital Signature");

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
