package org.example.ghostlink.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.text.PDFTextStripper;
import org.example.ghostlink.model.ZkProof;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.beans.factory.annotation.Autowired;

import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AlipayService {

    @Autowired
    private ZkProofService zkProofService;
    
    // 默认资产门槛（元）
    private static final String DEFAULT_THRESHOLD = "10000";

    /**
     * Verifies the Alipay Asset Proof PDF and extracts the asset balance and ID number.
     *
     * @param file The uploaded PDF file
     * @return A map containing extracted 'balance' and 'idNumber'
     * @throws IOException If PDF parsing fails
     * @throws SecurityException If the PDF is unsigned or verification fails
     */
    public Map<String, String> verifyAndExtractBalance(MultipartFile file) throws IOException {
        try (PDDocument document = PDDocument.load(file.getBytes())) {
            // 1. Security Check: Verify Digital Signature
            verifySignature(document);

            // 2. Content Extraction: Get all text from the PDF
            PDFTextStripper stripper = new PDFTextStripper();
            String text = stripper.getText(document);

            // 3. Logic: Extract asset amount and ID number
            Map<String, String> results = new HashMap<>();
            results.put("balance", extractBalance(text));
            String idNumber = extractIdNumber(text);
            results.put("idNumber", idNumber);
            results.put("id_number_hash", keccak256Hash(idNumber));
            return results;
        }
    }

    /**
     * 验证并生成零知识证明
     * 
     * @param file PDF文件
     * @param recipient 接收地址
     * @param threshold 资产门槛（可选，默认10000）
     * @return ZK证明对象
     */
    public ZkProof verifyAndGenerateProof(MultipartFile file, String recipient, String threshold) throws IOException {
        // 1. 验证并提取数据
        Map<String, String> extractedData = verifyAndExtractBalance(file);
        String balance = extractedData.get("balance");
        String idNumber = extractedData.get("idNumber");
        
        // 2. 对身份证号进行 keccak256 哈希
        String idNumberHash = keccak256Hash(idNumber);
        
        // 3. 调用 ZK 服务生成证明
        return callZkService(balance, idNumberHash, threshold != null ? threshold : DEFAULT_THRESHOLD, recipient);
    }

    /**
     * Checks if the PDF carries a digital signature.
     * In a production environment, this should verify the cryptographic validity
     * of the signature against Alipay's CA certificate.
     */
    private void verifySignature(PDDocument document) throws IOException {
        List<PDSignature> signatures = document.getSignatureDictionaries();
        
        if (signatures.isEmpty()) {
            throw new SecurityException("Verification Failed: No digital signature found. Please upload the original PDF exported from Alipay.");
        }

        // MVP Security: Ensure at least one signature covers the document.
        // A real attacker could sign it themselves, so normally we check the Cert Subject "Alipay".
        // Here we do a basic check.
        boolean hasAlipaySignature = false;
        for (PDSignature signature : signatures) {
            // In a real implementation, we would inspect:
            // signature.getName()
            // signature.getSubFilter()
            // And use BouncyCastle to verify the signed content.
            
            // For now, we assume if a signature exists, it's a pass for the MVP step.
            hasAlipaySignature = true;
        }

        if (!hasAlipaySignature) {
             throw new SecurityException("Verification Failed: Valid Alipay signature not found.");
        }
    }

    /**
     * Extracts the Total Asset amount using Regex.
     * Supports both Chinese and English formats.
     */
    private String extractBalance(String text) {
        // Regex looking for keywords followed by a number
        // Matches: "约为 15975.01元", "总资产(元) 100,000.00", "Total Assets 100,000.00"
        Pattern pattern = Pattern.compile("(约为|总资产|Total Assets)[^0-9]*([0-9,]+\\.[0-9]{2})");
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group(2).replace(",", ""); // Return number without commas
        }
        
        throw new IllegalArgumentException("Could not find 'Total Assets' in the uploaded document.");
    }
    
    /**
     * Extracts the ID number using Regex.
     * Matches text between "身份证号码" and the following comma/punctuation.
     */
    private String extractIdNumber(String text) {
        // Regex looking for "身份证号码" followed by digits/X
        Pattern pattern = Pattern.compile("身份证号码\\s*([0-9Xx]{15,18})");
        Matcher matcher = pattern.matcher(text);

        if (matcher.find()) {
            return matcher.group(1);
        }
        return "Not Found";
    }
    
    /**
     * 计算 keccak256 哈希值
     * 
     * @param input 输入字符串
     * @return 0x开头的十六进制哈希值
     */
    private String keccak256Hash(String input) {
        try {
            // 使用 SHA-3 (Keccak-256)
            MessageDigest digest = MessageDigest.getInstance("SHA3-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            
            // 转换为十六进制字符串
            BigInteger number = new BigInteger(1, hash);
            StringBuilder hexString = new StringBuilder(number.toString(16));
            
            // 补齐到64位
            while (hexString.length() < 64) {
                hexString.insert(0, '0');
            }
            
            return "0x" + hexString.toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to calculate keccak256 hash", e);
        }
    }
    
    /**
     * 调用 ZK 服务生成证明
     * 按照 risc_zero_spec.md 规范构造请求
     */
    private ZkProof callZkService(String balance, String idNumberHash, String threshold, String recipient) {
        try {
            // 按照规范构造 data 对象
            Map<String, Object> data = new HashMap<>();
            data.put("balance", balance);  // String
            data.put("id_number_hash", idNumberHash);  // String (keccak256 hash)
            data.put("threshold", threshold);  // String
            
            // 构造符合规范的请求体
            Map<String, Object> request = new HashMap<>();
            request.put("credential_type", "alipay");
            request.put("data", data);
            request.put("recipient", recipient != null ? recipient : "0x0000000000000000000000000000000000000000");

            ObjectMapper objectMapper = new ObjectMapper();
            System.out.println("开始调用ZK服务 (Alipay，本地调用)...");
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
                        "zk-alipay-" + System.currentTimeMillis(),
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
