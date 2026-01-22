# Ghostlink Spring Boot 应用

这是一个基于Spring Boot的Web应用，包含多个REST API端点供您测试和使用。

## 项目特性

- Spring Boot 3.5.9
- Java 21
- RESTful API
- 内存数据存储
- 完整的CRUD操作支持

## 运行项目

```bash
cd /Users/ppg/Desktop/kyp/ghostlink
./mvnw spring-boot:run
```

应用将在 `http://localhost:8080` 启动。

## API 端点

### 通用数据API

#### 获取系统信息
- **GET** `/api/v1/data/info`
- 返回当前系统的相关信息

#### 数学计算器
- **GET** `/api/v1/data/calculate`
- 参数：
  - `num1`: 第一个数字
  - `num2`: 第二个数字
  - `operation`: 操作类型 (+, -, *, / 或 add, subtract, multiply, divide)
- 示例：`/api/v1/data/calculate?num1=10&num2=5&operation=add`

### 示例项目API

#### 获取所有项目
- **GET** `/api/v1/items`

#### 根据ID获取项目
- **GET** `/api/v1/items/{id}`

#### 创建新项目
- **POST** `/api/v1/items`
- Content-Type: `application/json`
- 示例请求体：
```json
{
  "name": "新项目",
  "description": "项目描述"
}
```

#### 更新项目
- **PUT** `/api/v1/items/{id}`
- Content-Type: `application/json`

#### 删除项目
- **DELETE** `/api/v1/items/{id}`

#### 健康检查
- **GET** `/api/v1/health`

#### 欢迎信息
- **GET** `/api/v1/hello`

### 用户管理API

#### 获取所有用户
- **GET** `/api/v1/users`

#### 根据ID获取用户
- **GET** `/api/v1/users/{id}`

#### 创建新用户
- **POST** `/api/v1/users`
- Content-Type: `application/json`
- 示例请求体：
```json
{
  "name": "用户名",
  "email": "user@example.com",
  "role": "USER"
}
```

#### 更新用户
- **PUT** `/api/v1/users/{id}`
- Content-Type: `application/json`

#### 删除用户
- **DELETE** `/api/v1/users/{id}`

#### 搜索用户
- **GET** `/api/v1/users/search?name={name}`

## 示例请求

您可以使用curl或Postman等工具测试API：

```bash
# 获取所有示例项目
curl http://localhost:8080/api/v1/items

# 创建新项目
curl -X POST http://localhost:8080/api/v1/items \
  -H "Content-Type: application/json" \
  -d '{"name":"测试项目","description":"这是一个测试"}'

# 获取特定用户
curl http://localhost:8080/api/v1/users/1

# 计算数学表达式
curl "http://localhost:8080/api/v1/data/calculate?num1=15&num2=5&operation=divide"
```

## 项目结构

```
src/
├── main/
│   ├── java/org/example/ghostlink/
│   │   ├── controller/      # 控制器类
│   │   ├── model/           # 数据模型
│   │   ├── service/         # 业务逻辑
│   │   └── GhostlinkApplication.java  # 主应用类
│   └── resources/
│       └── application.properties
└── test/
```

## 技术栈

- Spring Boot
- Spring Web MVC
- Maven
- Java 21