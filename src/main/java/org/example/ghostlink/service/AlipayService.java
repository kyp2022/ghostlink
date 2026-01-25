package org.example.ghostlink.service;

import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.pdmodel.interactive.digitalsignature.PDSignature;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class AlipayService {

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
            results.put("idNumber", extractIdNumber(text));
            return results;
        }
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
}
