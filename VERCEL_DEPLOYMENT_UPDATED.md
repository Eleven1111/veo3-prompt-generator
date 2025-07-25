# 🚀 Vercel 部署指南（更新版）

## ✅ 已完成Vercel兼容性修复

### 🔧 主要变更

1. **移除传统后端**：将 Express.js + PostgreSQL + Redis 架构替换为 Next.js API Routes
2. **Serverless Functions**：所有API功能已转换为Vercel兼容的Serverless Functions
3. **内存存储**：使用内存缓存替代Redis和PostgreSQL（适合演示用途）
4. **优化配置**：更新所有配置文件以支持Vercel部署

### 📁 项目结构（Vercel兼容）

```
client/
├── src/app/api/           # Serverless API Routes
│   ├── generate-prompt/   # 生成提示API
│   ├── regenerate-prompt/ # 重新生成提示API
│   ├── admin/dashboard/   # 管理仪表板API
│   └── health/           # 健康检查API
├── src/app/              # Next.js应用页面
├── next.config.js        # Next.js配置
├── vercel.json          # Vercel部署配置
└── package.json         # 前端依赖
```

## 🚀 快速部署

### 方法1：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/veo3-prompt-generator&project-name=veo3-prompt-generator&repository-name=veo3-prompt-generator&root-directory=client)

### 方法2：命令行部署

1. **克隆项目**
   ```bash
   git clone https://github.com/yourusername/veo3-prompt-generator.git
   cd veo3-prompt-generator
   ```

2. **设置环境变量**
   ```bash
   cd client
   cp .env.local.example .env.local
   # 编辑 .env.local 并添加你的 GEMINI_API_KEY
   ```

3. **一键部署**
   ```bash
   ./deploy-vercel.sh
   # 或生产环境：
   ./deploy-vercel.sh prod
   ```

### 方法3：手动部署

```bash
cd client
npm install
vercel --prod
```

## 🔧 环境变量配置

在 Vercel 控制台设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | `AIza...` | **必需** Google Gemini API 密钥 |
| `NODE_ENV` | `production` | 环境标识 |

## 📋 API端点

### 主要API
- `POST /api/generate-prompt` - 生成Veo3提示
- `POST /api/regenerate-prompt` - 重新生成提示
- `GET /api/admin/dashboard` - 管理仪表板数据
- `GET /api/health` - 健康检查

### 请求示例
```javascript
// 生成提示
POST /api/generate-prompt
{
  "input": "A cat playing piano",
  "type": "text",
  "style": "cinematic",
  "quality": "high",
  "aspectRatio": "16:9"
}
```

## 🎯 功能限制说明

### 当前实现（演示版）
- ✅ 完整的提示生成功能
- ✅ 图片+文本输入支持
- ✅ 管理仪表板（模拟数据）
- ✅ 响应式设计
- ✅ 反垃圾保护

### 如需生产级功能
- 数据库持久化：使用 Vercel Postgres
- 用户认证：实现 JWT 认证
- 文件存储：使用 Vercel Blob
- 缓存：使用 Vercel KV (Redis)
- 分析：集成 Vercel Analytics

## 🛠️ 开发命令

```bash
# 本地开发
cd client
npm run dev

# 构建测试
npm run build

# 本地Vercel测试
vercel dev
```

## 📊 性能优化

- **自动优化**：图片、字体、脚本自动优化
- **CDN**：全球内容分发网络
- **缓存**：智能缓存策略
- **压缩**：自动Gzip压缩

## 🔍 故障排除

### 常见问题

1. **API超时**
   - 检查Gemini API密钥是否正确
   - 确认网络连接

2. **部署失败**
   - 确保在 `client` 目录部署
   - 检查环境变量是否设置

3. **404错误**
   - 确认API路由文件存在
   - 检查Next.js配置

### 调试工具

- **Vercel控制台**：查看函数日志
- **本地测试**：`vercel dev`
- **API测试**：访问 `/api/health`

## 📞 获取帮助

- **Vercel文档**：[vercel.com/docs](https://vercel.com/docs)
- **Next.js文档**：[nextjs.org/docs](https://nextjs.org/docs)
- **Google AI Studio**：[makersuite.google.com](https://makersuite.google.com)

---

🎉 **现在支持一键部署到Vercel！**