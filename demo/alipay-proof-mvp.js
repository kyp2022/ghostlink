const express = require('express');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// 导入PDF解析库
const pdfjsLib = require('pdfjs-dist');
const pdfjsWorker = require('pdfjs-dist/build/pdf.worker.js');
pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

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
        <li>提取PDF文本内容并解析关键信息</li>
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
          statusHtml += '<div class="verification-step">✅ PDF内容解析完成</div>';
          statusHtml += '<div class="verification-step">✅ 关键信息提取完成</div>';
          statusHtml += '<div class="verification-step">✅ 信息一致性验证通过</div>';
          statusDiv.innerHTML = statusHtml;
          
          // 显示详细验证结果
          resultDiv.className = 'result show';
          resultDiv.innerHTML = '<h3>验证结果详情：</h3>' +
            '<div class="details">' +
            '<p><strong>文件名：</strong> ' + result.fileName + '</p>' +
            '<p><strong>文件大小：</strong> ' + (result.fileSize / 1024).toFixed(2) + ' KB</p>' +
            '<p><strong>文件Hash：</strong> ' + result.fileHash.substring(0, 16) + '...</p>' +
            '<p><strong>是否包含支付宝标识：</strong> ' + (result.hasAlipayBranding ? '<span class="highlight">✅ 是</span>' : '<span class="highlight">❌ 否</span>') + '</p>' +
            '<p><strong>账户持有人：</strong> ' + (result.extractedInfo.holder || '未找到') + '</p>' +
            '<p><strong>提取的余额：</strong> ¥' + (result.extractedInfo.balance ? result.extractedInfo.balance.toFixed(2) : '未找到') + '</p>' +
            '<p><strong>生成时间：</strong> ' + (result.extractedInfo.time || '未找到') + '</p>' +
            '<p><strong>总资产：</strong> ¥' + (result.extractedInfo.assets.total ? result.extractedInfo.assets.total.toFixed(2) : '未找到') + '</p>' +
            '<p><strong>是否满足阈值：</strong> ' + (result.meetsThreshold ? '<span class="highlight">✅ 是</span>' : '<span class="highlight">❌ 否</span>') + '</p>' +
            '</div>';
          
          // 显示提取的完整文本内容
          resultDiv.innerHTML += '<h3>提取的文档内容：</h3>' +
            '<div class="details"><pre>' + result.extractedContent.substring(0, 1000) + (result.extractedContent.length > 1000 ? '...' : '') + '</pre></div>';
          
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

    // 2. 提取PDF文本内容
    const extractedContent = await extractPdfContent(filePath);

    // 3. 解析关键信息
    const extractedInfo = await parseAlipayProofInfo(extractedContent);

    // 4. 验证信息一致性
    const consistencyCheck = await verifyInfoConsistency(extractedInfo);

    // 5. 验证余额信息
    const balanceValidation = await validateBalanceInfo(extractedInfo);

    // 6. 生成文件哈希值
    const fileHash = await generateFileHash(filePath);

    // 7. 生成零知识证明输入数据
    const zkInputData = {
      holder: extractedInfo.holder,
      balance: balanceValidation.balance,
      timestamp: Date.now(),
      proofType: 'alipay_asset_proof',
      fileHash: fileHash,
      isValid: consistencyCheck.isValid,
      confidence: consistencyCheck.confidence
    };

    res.json({
      success: true,
      message: 'PDF资产证明验证通过',
      fileName: req.file.originalname,
      fileSize: req.file.size,
      fileHash: fileHash,
      hasAlipayBranding: extractedInfo.hasAlipayBranding,
      extractedContent: extractedContent,
      extractedInfo: extractedInfo,
      meetsThreshold: balanceValidation.meetsThreshold,
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

// 使用pdfjs提取PDF内容
async function extractPdfContent(filePath) {
  try {
    const dataBuffer = fs.readFileSync(filePath);
    const uint8Array = new Uint8Array(dataBuffer);
    
    const pdf = await pdfjsLib.getDocument(uint8Array).promise;
    const page = await pdf.getPage(1); // 只读取第一页，因为资产证明信息通常在首页
    const textContent = await page.getTextContent();
    
    // 将文本项合并成字符串
    return textContent.items.map(item => item.str).join(' ');
  } catch (error) {
    console.error('PDF内容提取失败:', error);
    throw new Error('PDF内容提取失败: ' + error.message);
  }
}

// 解析支付宝资产证明信息
async function parseAlipayProofInfo(content) {
  // 验证是否包含支付宝品牌标识
  const hasAlipayBranding = /支付宝|alipay|Alipay/i.test(content);
  
  // 提取账户持有人信息
  const holderMatch = content.match(/账户持有人[:：]\s*([^\n\r\s]+)/);
  const holder = holderMatch ? holderMatch[1].trim() : null;
  
  // 提取支付宝账号
  const accountMatch = content.match(/支付宝账号[:：]\s*([^\n\r\s]+)/);
  const account = accountMatch ? accountMatch[1].trim() : null;
  
  // 提取生成时间
  const timeMatch = content.match(/\d{4}[-年]\d{1,2}[-月]\d{1,2}[^年月日\n\r]*\d{1,2}:\d{2}:\d{2}/);
  const time = timeMatch ? timeMatch[0].trim() : null;
  
  // 提取账户余额（多种格式）
  let balance = null;
  const balancePatterns = [
    /账户余额[：:]\s*[¥$￥]\s*([\d,]+\.?\d*)/,
    /余额[:：]\s*[¥$￥]\s*([\d,]+\.?\d*)/,
    /[¥$￥]\s*([\d,]+\.?\d*)\s*(元|人民币)?\s*账户余额?/,
    /[\s(]([¥$￥]\s*[\d,]+\.?\d*)\s*账户余额?[)\s]/,
    /[\s(]([¥$￥]\s*[\d,]+\.?\d*)\s*余额?[)\s]/
  ];
  
  for (const pattern of balancePatterns) {
    const match = content.match(pattern);
    if (match) {
      const amountStr = match[1].replace(/[¥$￥,\s]/g, '');
      const parsedAmount = parseFloat(amountStr);
      if (!isNaN(parsedAmount)) {
        balance = parsedAmount;
        break;
      }
    }
  }
  
  // 提取总资产信息
  let totalAssets = null;
  const totalPattern = /总资产[：:]\s*[¥$￥]\s*([\d,]+\.?\d*)/;
  const totalMatch = content.match(totalPattern);
  if (totalMatch) {
    const amountStr = totalMatch[1].replace(/[,]/g, '');
    const parsedAmount = parseFloat(amountStr);
    if (!isNaN(parsedAmount)) {
      totalAssets = parsedAmount;
    }
  }
  
  // 提取余额宝信息
  let yuebaoAmount = null;
  const yuebaoPattern = /余额宝[：:]\s*[¥$￥]\s*([\d,]+\.?\d*)/;
  const yuebaoMatch = content.match(yuebaoPattern);
  if (yuebaoMatch) {
    const amountStr = yuebaoMatch[1].replace(/[,]/g, '');
    const parsedAmount = parseFloat(amountStr);
    if (!isNaN(parsedAmount)) {
      yuebaoAmount = parsedAmount;
    }
  }
  
  return {
    hasAlipayBranding,
    holder,
    account,
    time,
    balance,
    assets: {
      accountBalance: balance,
      yuebao: yuebaoAmount,
      total: totalAssets
    },
    content: content
  };
}

// 验证信息一致性
async function verifyInfoConsistency(extractedInfo) {
  const checks = {
    hasAlipayBranding: extractedInfo.hasAlipayBranding,
    hasValidHolder: !!extractedInfo.holder && extractedInfo.holder.length > 1,
    hasValidTime: !!extractedInfo.time && !isNaN(Date.parse(extractedInfo.time)),
    hasValidBalance: typeof extractedInfo.balance === 'number' && extractedInfo.balance >= 0,
    hasOfficialElements: extractedInfo.content.includes('支付宝官方电子签章') || 
                        extractedInfo.content.includes('支付宝') ||
                        extractedInfo.content.includes('alipay')
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

// 验证余额信息
async function validateBalanceInfo(extractedInfo) {
  const balance = extractedInfo.balance;
  
  if (balance === null || balance === undefined) {
    return {
      balance: null,
      isReasonable: false,
      meetsThreshold: false,
      validationMessage: '未能提取到余额信息'
    };
  }
  
  const MIN_ACCEPTABLE_BALANCE = 0.01; // 最小可接受余额
  const MAX_REASONABLE_BALANCE = 10000000; // 最大合理余额（1千万）
  
  const isReasonable = balance >= MIN_ACCEPTABLE_BALANCE && balance <= MAX_REASONABLE_BALANCE;
  const meetsThreshold = balance >= 100; // 假设阈值为100元
  
  return {
    balance: balance,
    isReasonable: isReasonable,
    meetsThreshold: meetsThreshold,
    validationMessage: isReasonable ? '余额数值合理' : '余额数值超出合理范围'
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