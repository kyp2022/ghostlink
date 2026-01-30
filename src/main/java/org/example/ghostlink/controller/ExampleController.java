package org.example.ghostlink.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.security.SecureRandom;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(originPatterns = "*")
public class ExampleController {

    // 用于生成随机数据
    private static final SecureRandom random = new SecureRandom();

    // 示例数据存储（实际应用中应使用数据库）
    private static List<Map<String, Object>> sampleData = new ArrayList<>();

    static {
        Map<String, Object> item1 = new HashMap<>();
        item1.put("id", 1);
        item1.put("name", "示例项目1");
        item1.put("description", "这是一个示例描述");
        sampleData.add(item1);

        Map<String, Object> item2 = new HashMap<>();
        item2.put("id", 2);
        item2.put("name", "示例项目2");
        item2.put("description", "这是另一个示例描述");
        sampleData.add(item2);
    }

    // GET 请求：获取所有项目
    @GetMapping("/items")
    public ResponseEntity<List<Map<String, Object>>> getAllItems() {
        return ResponseEntity.ok(sampleData);
    }

    // GET 请求：根据ID获取单个项目
    @GetMapping("/items/{id}")
    public ResponseEntity<Map<String, Object>> getItemById(@PathVariable Integer id) {
        Map<String, Object> item = sampleData.stream()
                .filter(i -> i.get("id").equals(id))
                .findFirst()
                .orElse(null);

        if (item != null) {
            return ResponseEntity.ok(item);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // POST 请求：创建新项目
    @PostMapping("/items")
    public ResponseEntity<Map<String, Object>> createItem(@RequestBody Map<String, Object> newItem) {
        // 在实际应用中，这里应该验证输入数据
        int newId = sampleData.size() > 0 ? 
            sampleData.stream().mapToInt(i -> (Integer) i.get("id")).max().orElse(0) + 1 : 1;
        
        newItem.put("id", newId);
        sampleData.add(newItem);
        
        return ResponseEntity.ok(newItem);
    }

    // PUT 请求：更新现有项目
    @PutMapping("/items/{id}")
    public ResponseEntity<Map<String, Object>> updateItem(
            @PathVariable Integer id, 
            @RequestBody Map<String, Object> updatedItem) {
        
        for (int i = 0; i < sampleData.size(); i++) {
            Map<String, Object> item = sampleData.get(i);
            if (item.get("id").equals(id)) {
                updatedItem.put("id", id); // 确保ID保持不变
                sampleData.set(i, updatedItem);
                return ResponseEntity.ok(updatedItem);
            }
        }
        
        return ResponseEntity.notFound().build();
    }

    // DELETE 请求：删除项目
    @DeleteMapping("/items/{id}")
    public ResponseEntity<Void> deleteItem(@PathVariable Integer id) {
        boolean removed = sampleData.removeIf(item -> item.get("id").equals(id));
        
        if (removed) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // 健康检查端点
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("message", "服务运行正常");
        response.put("application", "ghostlink");
        
        return ResponseEntity.ok(response);
    }
    
    // 简单的欢迎信息
    @GetMapping("/hello")
    public ResponseEntity<Map<String, String>> hello() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "欢迎使用Ghostlink Spring Boot应用!");
        response.put("timestamp", String.valueOf(System.currentTimeMillis()));
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 返回固定格式但内容每次请求都不同的数据
     */
    @GetMapping("/receipt-data")
    public ResponseEntity<Map<String, String>> getReceiptData() {
        Map<String, String> response = new HashMap<>();
        
        // 设置状态
        response.put("status", "success");
        
        // 生成固定长度的随机十六进制字符串
        response.put("receipt_hex", generateRandomHexString(224)); // 对应112字节
        response.put("journal_hex", generateRandomHexString(98));  // 对应49字节
        response.put("image_id_hex", generateRandomHexString(64)); // 对应32字节
        response.put("nullifier_hex", generateRandomHexString(64)); // 对应32字节
        
        return ResponseEntity.ok(response);
    }
    
    /**
     * 生成指定长度的随机十六进制字符串
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