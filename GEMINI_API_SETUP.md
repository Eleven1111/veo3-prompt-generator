# Google Gemini API 设置指南

## 🔑 获取 Gemini API Key

### 1. 访问 Google AI Studio

1. 打开浏览器，访问 [Google AI Studio](https://aistudio.google.com/)
2. 使用你的 Google 账户登录

### 2. 创建 API Key

1. 在 Google AI Studio 主页，点击左侧菜单中的 **"Get API key"**
2. 点击 **"Create API key"** 按钮
3. 选择一个 Google Cloud 项目（如果没有，会自动创建一个）
4. 点击 **"Create API key in new project"** 或选择现有项目
5. 复制生成的 API Key（格式类似：`AIzaSyC...`）

### 3. 配置环境变量

将获取的 API Key 添加到你的环境变量中：

```bash
# 在 .env 文件中添加
GEMINI_API_KEY=AIzaSyC_your_actual_api_key_here
```

### 4. 验证 API Key

你可以使用以下命令测试 API Key 是否有效：

```bash
curl -H 'Content-Type: application/json' \
     -d '{"contents":[{"parts":[{"text":"Hello"}]}]}' \
     -X POST "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=YOUR_API_KEY"
```

## 🚀 Gemini 2.0 Flash 特性

### 模型优势

- **速度快**: 比 Gemini Pro 快 2 倍
- **成本低**: 比 Gemini Pro 便宜 50%
- **多模态**: 支持文本和图像输入
- **长上下文**: 支持最多 1M tokens
- **高质量**: 保持高质量的输出

### 适用场景

- ✅ 实时对话应用
- ✅ 内容生成
- ✅ 图像分析
- ✅ 代码生成
- ✅ 创意写作

## 💰 定价信息

### Gemini 2.0 Flash 定价（截至 2024 年）

| 类型 | 价格 |
|------|------|
| 输入 | $0.075 / 1M tokens |
| 输出 | $0.30 / 1M tokens |
| 图像输入 | $0.0025 / 图像 |

### 免费配额

- 每分钟 15 个请求
- 每天 1,500 个请求
- 每月 100 万 tokens

## 🔧 在项目中使用

### 1. 安装依赖

```bash
npm install @google/generative-ai
```

### 2. 基本使用示例

```typescript
import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

async function generateContent() {
  const prompt = "Write a creative story about AI"
  const result = await model.generateContent(prompt)
  const response = await result.response
  const text = response.text()
  console.log(text)
}
```

### 3. 图像分析示例

```typescript
async function analyzeImage(imageBuffer: Buffer) {
  const imagePart = {
    inlineData: {
      data: imageBuffer.toString('base64'),
      mimeType: 'image/jpeg'
    }
  }

  const prompt = "Describe this image in detail"
  const result = await model.generateContent([prompt, imagePart])
  const response = await result.response
  return response.text()
}
```

## 🛡️ 安全最佳实践

### 1. API Key 安全

- ❌ 不要在客户端代码中暴露 API Key
- ❌ 不要将 API Key 提交到版本控制
- ✅ 使用环境变量存储 API Key
- ✅ 在生产环境中使用密钥管理服务

### 2. 请求限制

```typescript
// 实现请求重试机制
async function generateWithRetry(prompt: string, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const result = await model.generateContent(prompt)
      return await result.response.text()
    } catch (error) {
      if (i === maxRetries - 1) throw error
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)))
    }
  }
}
```

### 3. 内容过滤

```typescript
// 检查响应是否被安全过滤器阻止
const response = await result.response
if (response.candidates?.[0]?.finishReason === 'SAFETY') {
  throw new Error('Content was filtered for safety reasons')
}
```

## 🔍 故障排除

### 常见错误

#### 1. API Key 无效
```
Error: API key not valid
```
**解决方案**: 检查 API Key 是否正确复制，确保没有多余的空格

#### 2. 配额超限
```
Error: Quota exceeded
```
**解决方案**: 等待配额重置或升级到付费计划

#### 3. 模型不存在
```
Error: Model not found
```
**解决方案**: 确认使用正确的模型名称 `gemini-2.0-flash-exp`

#### 4. 请求过大
```
Error: Request too large
```
**解决方案**: 减少输入内容长度或图像大小

### 调试技巧

1. **启用详细日志**:
```typescript
console.log('Request:', prompt)
console.log('Response:', response.text())
```

2. **检查响应元数据**:
```typescript
console.log('Usage metadata:', response.usageMetadata)
console.log('Finish reason:', response.candidates?.[0]?.finishReason)
```

## 📚 相关资源

- [Google AI Studio](https://aistudio.google.com/)
- [Gemini API 文档](https://ai.google.dev/docs)
- [定价信息](https://ai.google.dev/pricing)
- [安全指南](https://ai.google.dev/docs/safety_guidance)
- [最佳实践](https://ai.google.dev/docs/best_practices)

## 🆚 与 OpenAI 的对比

| 特性 | Gemini 2.0 Flash | GPT-4 |
|------|------------------|-------|
| 速度 | 更快 | 较慢 |
| 成本 | 更低 | 较高 |
| 多模态 | 原生支持 | 需要 GPT-4V |
| 上下文长度 | 1M tokens | 128K tokens |
| 免费配额 | 有 | 无 |

---

🎉 现在你已经准备好使用 Google Gemini 2.0 Flash 来为你的 Veo3 Prompt Generator 提供强大的 AI 能力了！