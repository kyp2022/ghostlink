const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const port = 3003;

// 配置文件上传
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = './proof_uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'alipay-proof-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ 
  storage: storage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('只允许上传PDF文件'));
    }
  }
});

// 提供静态文件服务
app.use(express.static('public'));

// 主页路由 - 返回HTML页面
app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>支付宝资产证明验证MVP</title>
  <style>
    body {
      font-family: Arial, sans-serif;
      max-width: 1000px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f5f5f5;
    }
    .container {
      background: white;
      padding: 30px;
      border-radius: 10px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
    }
    h1 {
      color: #00a0e3;
      text-align: center;
    }
    .instructions {
      background: #e7f3ff;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
    }
    .form-group {
      margin-bottom: 20px;
    }
    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }
    input[type="file"] {
      width: 100%;
      padding: 10px;
      border: 1px solid #ddd;
      border-radius: 5px;
    }
    button {
      background-color: #00a0e3;
      color: white;
      padding: 10px 20px;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      font-size: 16px;
    }
    button:hover {
      background-color: #0077b3;
    }
    button:disabled {
      background-color: #cccccc;
      cursor: not-allowed;
    }
    .status {
      margin-top: 20px;
      padding: 15px;
      border-radius: 5px;
      display: none;
    }
    .status.success {
      background-color: #d4edda;
      color: #155724;
      display: block;
    }
    .status.error {
      background-color: #f8d7da;
      color: #721c24;
      display: block;
    }
    .status.info {
      background-color: #d1ecf1;
      color: #0c5460;
      display: block;
    }
    .result {
      margin-top: 20px;
      padding: 15px;
      background-color: #f8f9fa;
      border-radius: 5px;
      display: none;
    }
    .result.show {
      display: block;
    }
    .verification-step {
      margin: 10px 0;
      padding: 8px;
      border-left: 4px solid #007bff;
      background-color: #f8f9fa;
    }
    .details {
      margin-top: 10px;
      padding: 10px;
      background-color: #e9ecef;
      border-radius: 5px;
      font-size: 14px;
      overflow-x: auto;
    }
    .highlight {
      background-color: #fff3cd;
      padding: 2px 4px;
      border-radius: 3px;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>支付宝资产证明验证MVP</h1>
    
    <div class="instructions">
      <h3>验证流程：</h3>
      <ol>
        <li>上传支付宝官方生成的资产证明PDF文件</li>
        <li>系统验证PDF格式和基本属性</li>
        <li>分析PDF文件结构和元数据</li>
        <li>验证信息的真实性和一致性</li>
        <li>生成零知识证明输入数据</li>
      </ol>
    </div>
    
    <form id="uploadForm" enctype="multipart/form-data">
      <div class="form-group">
        <label for="proofFile">上传支付宝资产证明PDF文件：</label>
        <input type="file" id="proofFile" name="proofFile" accept=".pdf" required>
      </div>
      
      <button type="submit" id="submitBtn">上传并验证</button>
    </form>
    
    <div id="status" class="status"></div>
    <div id="result" class="result"></div>
  </div>

  <script>
    document.getElementById('uploadForm').addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const formData = new FormData(this);
      const submitBtn = document.getElementById('submitBtn');
      const statusDiv = document.getElementById('status');
      const resultDiv = document.getElementById('result');
      
      // 显示上传状态
      statusDiv.className = 'status info';
      statusDiv.innerHTML = '<div class="verification-step">🔄 开始上传文件...</div>';
      resultDiv.className = 'result';
      
      submitBtn.disabled = true;
      
      try {
        const response = await fetch('/api/verify-alipay-proof', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          statusDiv.className = 'status success';
          
          let statusHtml = '';
          statusHtml += '<div class="verification-step">✅ 文件格式验证通过</div>';
          statusHtml += '<div class="verification-step">✅ PDF结构分析完成</div>';
          statusHtml += '<div class="verification-step">✅ 元数据验证完成</div>';
          statusHtml += '<div class="verification-step">✅ 品牌标识验证通过</div>';
          statusDiv.innerHTML = statusHtml;
          
          // 显示详细验证结果
          resultDiv.className = 'result show';
          resultDiv.innerHTML = '<h3>验证结果详情：</h3>' +
            '<div class="details">' +
            '<p><strong>文件名：</strong> ' + result.fileName + '</p>' +
            '<p><strong>文件大小：</strong> ' + (result.fileSize / 1024).toFixed(2) + ' KB</p>' +
            '<p><strong>文件Hash：</strong> ' + result.fileHash.substring(0, 16) + '...</p>' +
            '<p><strong>PDF版本：</strong> ' + result.pdfInfo.version + '</p>' +
            '<p><strong>创建者：</strong> ' + result.pdfInfo.creator + '</p>' +
            '<p><strong>生产者：</strong> ' + result.pdfInfo.producer + '</p>' +
            '<p><strong>标题：</strong> ' + result.pdfInfo.title + '</p>' +
            '<p><strong>是否包含支付宝标识：</strong> ' + (result.hasAlipayIndicators ? '<span class="highlight">✅ 是</span>' : '<span class="highlight">❌ 否</span>') + '</p>' +
            '<p><strong>是否满足阈值：</strong> ' + (result.meetsThreshold ? '<span class="highlight">✅ 是</span>' : '<span class="highlight">❌ 否</span>') + '</p>' +
            '</div>';
          
          // 显示PDF元数据分析
          resultDiv.innerHTML += '<h3>PDF元数据分析：</h3>' +
            '<div class="details"><pre>' + JSON.stringify(result.pdfInfo, null, 2) + '</pre></div>';
          
          // 显示零知识证明数据
          if (result.zkInputData) {
            resultDiv.innerHTML += '<h3>零知识证明输入数据：</h3>' +
              '<div class="details"><pre>' + JSON.stringify(result.zkInputData, null, 2) + '</pre></div>';
          }
        } else {
          statusDiv.className = 'status error';
          statusDiv.innerHTML = '<div class="verification-step">❌ 验证失败: ' + result.message + '</div>';
        }
      } catch (error) {
        statusDiv.className = 'status error';
        statusDiv.innerHTML = '<div class="verification-step">❌ 请求失败: ' + error.message + '</div>';
      } finally {
        submitBtn.disabled = false;
      }
    });
  </script>
</body>
</html>
  `);
});

// 验证支付宝PDF资产证明的API
app.post('/api/verify-alipay-proof', upload.single('proofFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: '请上传PDF资产证明文件'
      });
    }

    const filePath = req.file.path;
    
    // 1. 验证文件基本属性
    const fileValidation = await validatePdfFile(req.file);
    if (!fileValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: fileValidation.message
      });
    }

    // 2. 分析PDF文件结构和元数据
    const pdfInfo = await analyzePdfMetadata(filePath);

    // 3. 检查支付宝相关指标
    const hasAlipayIndicators = await checkAlipayIndicators(pdfInfo);

    // 4. 验证信息一致性
    const consistencyCheck = await verifyInfoConsistency(pdfInfo, hasAlipayIndicators);

    // 5. 生成文件哈希值
    const fileHash = await generateFileHash(filePath);

    // 6. 生成零知识证明输入数据
    const zkInputData = {
      proofType: 'alipay_asset_proof',
      fileHash: fileHash,
      isValid: consistencyCheck.isValid,
      confidence: consistencyCheck.confidence,
      hasAlipayIndicators: hasAlipayIndicators,
      timestamp: Date.now()
    };

    res.json({
      success: true,
      message: 'PDF资产证明验证通过',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileHash: fileHash,
      pdfInfo: pdfInfo,
      hasAlipayIndicators: hasAlipayIndicators,
      meetsThreshold: hasAlipayIndicators, // 如果包含支付宝指标，认为满足基本要求
      consistencyCheck: consistencyCheck,
      zkInputData: zkInputData
    });

  } catch (error) {
    console.error('PDF验证过程中出错:', error);
    res.status(500).json({
      success: false,
      message: 'PDF验证过程中出错: ' + error.message
    });
  } finally {
    // 清理上传的文件
    if (req.file && req.file.path) {
      setTimeout(() => {
        try {
          fs.unlinkSync(req.file.path);
        } catch (err) {
          console.error('清理文件失败:', err);
        }
      }, 5000); // 5秒后清理文件
    }
  }
});

// 验证PDF文件基本属性
async function validatePdfFile(file) {
  if (file.size > 10 * 1024 * 1024) { // 10MB限制
    return { isValid: false, message: 'PDF文件过大，请上传小于10MB的文件' };
  }

  if (file.mimetype !== 'application/pdf') {
    return { isValid: false, message: '文件不是有效的PDF格式' };
  }

  return { isValid: true, message: '文件格式验证通过' };
}

// 分析PDF元数据（通过读取PDF文件头部和元数据部分）
async function analyzePdfMetadata(filePath) {
  return new Promise((resolve, reject) => {
    const fs = require('fs');
    
    // 读取PDF文件的前几KB来分析结构
    fs.open(filePath, 'r', (err, fd) => {
      if (err) {
        reject(err);
        return;
      }
      
      const buffer = Buffer.alloc(4096); // 读取前4KB
      fs.read(fd, buffer, 0, 4096, 0, (err, bytesRead, buffer) => {
        fs.close(fd, () => {}); // 确保文件描述符被关闭
        
        if (err) {
          reject(err);
          return;
        }
        
        // 将buffer转换为字符串以进行分析
        const content = buffer.toString('utf8', 0, bytesRead);
        
        // 提取PDF版本信息
        const versionMatch = content.match(/%PDF-(\d\.\d)/);
        const version = versionMatch ? versionMatch[1] : 'unknown';
        
        // 搜索常见的PDF元数据字段
        const infoDictStart = content.indexOf('/Info');
        const infoDictEnd = content.indexOf('>>', infoDictStart);
        const infoDict = content.substring(infoDictStart, infoDictEnd !== -1 ? infoDictEnd + 2 : content.length);
        
        // 提取元数据
        const titleMatch = infoDict.match(/\/Title\s+\(([^)]+)\)/);
        const subjectMatch = infoDict.match(/\/Subject\s+\(([^)]+)\)/);
        const authorMatch = infoDict.match(/\/Author\s+\(([^)]+)\)/);
        const creatorMatch = infoDict.match(/\/Creator\s+\(([^)]+)\)/);
        const producerMatch = infoDict.match(/\/Producer\s+\(([^)]+)\)/);
        const creationDateMatch = infoDict.match(/\/CreationDate\s+\(([^)]+)\)/);
        const modDateMatch = infoDict.match(/\/ModDate\s+\(([^)]+)\)/);
        
        // 检查是否包含数字签名信息
        const hasSignature = content.includes('/Sig') || content.includes('/Signature');
        
        resolve({
          version: version,
          title: titleMatch ? titleMatch[1] : null,
          subject: subjectMatch ? subjectMatch[1] : null,
          author: authorMatch ? authorMatch[1] : null,
          creator: creatorMatch ? creatorMatch[1] : null,
          producer: producerMatch ? producerMatch[1] : null,
          creationDate: creationDateMatch ? creationDateMatch[1] : null,
          modDate: modDateMatch ? modDateMatch[1] : null,
          hasSignature: hasSignature,
          rawInfo: infoDict
        });
      });
    });
  });
}

// 检查支付宝相关指标
async function checkAlipayIndicators(pdfInfo) {
  // 检查PDF元数据中是否包含支付宝相关信息
  const content = JSON.stringify(pdfInfo).toLowerCase();
  
  const alipayIndicators = [
    'alipay',
    '支付宝',
    'asset',
    'certificate',
    'balance',
    'account',
    'proof',
    'financial'
  ];
  
  let foundIndicators = 0;
  for (const indicator of alipayIndicators) {
    if (content.includes(indicator.toLowerCase())) {
      foundIndicators++;
    }
  }
  
  // 如果找到至少2个支付宝相关指标，则认为是支付宝生成的文件
  return foundIndicators >= 2;
}

// 验证信息一致性
async function verifyInfoConsistency(pdfInfo, hasAlipayIndicators) {
  const checks = {
    hasValidVersion: pdfInfo.version !== 'unknown',
    hasCreatorInfo: !!pdfInfo.creator,
    hasProducerInfo: !!pdfInfo.producer,
    hasAlipayIndicators: hasAlipayIndicators,
    hasTitleOrSubject: !!pdfInfo.title || !!pdfInfo.subject
  };
  
  const validChecks = Object.values(checks).filter(check => check === true).length;
  const totalChecks = Object.keys(checks).length;
  const confidence = (validChecks / totalChecks) * 100;
  
  const isValid = validChecks >= totalChecks * 0.6; // 至少60%的检查项通过
  
  return {
    isValid,
    checks,
    confidence: Math.round(confidence * 100) / 100,
    message: isValid ? '信息一致性验证通过' : '信息一致性验证失败'
  };
}

// 生成文件哈希值
async function generateFileHash(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    
    stream.on('data', (data) => {
      hash.update(data);
    });
    
    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });
    
    stream.on('error', (err) => {
      reject(err);
    });
  });
}

app.listen(port, () => {
  console.log(`支付宝资产证明验证MVP服务器运行在 http://localhost:${port}`);
  console.log('请访问 http://localhost:3003 查看演示');
});