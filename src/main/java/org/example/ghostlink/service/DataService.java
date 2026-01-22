package org.example.ghostlink.service;

import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class DataService {
    
    /**
     * 获取系统信息
     */
    public Map<String, Object> getSystemInfo() {
        Map<String, Object> info = new HashMap<>();
        info.put("application", "Ghostlink");
        info.put("version", "1.0.0");
        info.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        info.put("status", "running");
        info.put("java_version", System.getProperty("java.version"));
        info.put("os_name", System.getProperty("os.name"));
        
        return info;
    }
    
    /**
     * 处理数据计算
     */
    public Map<String, Object> calculateResult(double num1, double num2, String operation) {
        Map<String, Object> result = new HashMap<>();
        double calculatedValue = 0;
        
        switch (operation.toLowerCase()) {
            case "add":
            case "+":
                calculatedValue = num1 + num2;
                break;
            case "subtract":
            case "-":
                calculatedValue = num1 - num2;
                break;
            case "multiply":
            case "*":
                calculatedValue = num1 * num2;
                break;
            case "divide":
            case "/":
                if (num2 != 0) {
                    calculatedValue = num1 / num2;
                } else {
                    result.put("error", "Division by zero is not allowed");
                    return result;
                }
                break;
            default:
                result.put("error", "Unsupported operation: " + operation);
                return result;
        }
        
        result.put("operation", operation);
        result.put("num1", num1);
        result.put("num2", num2);
        result.put("result", calculatedValue);
        result.put("timestamp", LocalDateTime.now().format(DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss")));
        
        return result;
    }
}