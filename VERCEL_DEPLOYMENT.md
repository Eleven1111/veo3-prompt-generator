# Vercel 部署指南

## 🚀 快速部署到 Vercel

### 前置条件

1. **Vercel 账户**: 在 [vercel.com](https://vercel.com) 注册账户
2. **Vercel CLI**: 安装 Vercel 命令行工具
   ```bash
   npm install -g vercel
   ```
3. **Google Gemini API Key**: 准备好你的 Gemini API 密钥

### 方法一：一键部署（推荐）

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/veo3-prompt-generator&project-name=veo3-prompt-generator&repository-name=veo3-prompt-generator)

点击上面的按钮，然后：

1. **连接 GitHub**: 授权 Vercel 访问你的 GitHub 仓库
2. **配置项目**: 
   - Project Name: `veo3-prompt-generator`
   - Framework Preset: `Next.js`
   - Root Directory: `client`
3. **设置环境变量**:
   ```
   GEMINI_API_KEY=your_gemini_api_key_here
   NODE_ENV=production
   ```
4. **点击 Deploy**: 等待部署完成

### 方法二：命令行部署

```bash
# 1. 克隆项目
git clone https://github.com/yourusername/veo3-prompt-generator.git
cd veo3-prompt-generator

# 2. 使用部署脚本
./scripts/deploy-vercel.sh

# 或者手动部署
cd client
vercel --prod
```

### 环境变量配置

在 Vercel 控制台中设置以下环境变量：

| 变量名 | 值 | 说明 |
|--------|-----|------|
| `GEMINI_API_KEY` | `AIza...` | Google Gemini API 密钥（必需） |
| `NODE_ENV` | `production` | 环境标识 |

### 部署后配置

#### 1. 自定义域名（可选）

1. 进入 Vercel 项目设置
2. 点击 "Domains" 标签
3. 添加你的自定义域名
4. 按照提示配置 DNS

#### 2. 分析和监控

```bash
# 安装 Vercel Analytics
npm install @vercel/analytics

# 在 layout.tsx 中添加
import { Analytics } from '@vercel/analytics/react'

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
```

#### 3. 性能优化

Vercel 自动提供：
- **CDN**: 全球内容分发网络
- **Edge Functions**: 边缘计算
- **Image Optimization**: 自动图片优化
- **Automatic HTTPS**: 自动 SSL 证书

## 🔧 Vercel 特定配置

### API Routes 限制

由于 Vercel 的 Serverless 特性，有以下限制：

1. **执行时间**: 最长 30 秒（Hobby 计划为 10 秒）
2. **内存限制**: 1024MB
3. **文件上传**: 建议使用云存储服务
4. **数据库**: 推荐使用 Vercel Postgres 或外部数据库

### 推荐的外部服务

#### 数据库
- **Vercel Postgres**: 官方 PostgreSQL 服务
- **PlanetScale**: MySQL 兼容数据库
- **Supabase**: 开源 Firebase 替代品

#### 文件存储
- **Vercel Blob**: 官方文件存储
- **Cloudinary**: 图片和视频管理
- **AWS S3**: 对象存储服务

#### 缓存
- **Vercel KV**: 官方 Redis 服务
- **Upstash**: Serverless Redis

### 配置示例

```javascript
// vercel.json
{
  "functions": {
    "client/src/app/api/**/*.ts": {
      "maxDuration": 30
    }
  },
  "env": {
    "GEMINI_API_KEY": "@gemini-api-key"
  }
}
```

## 🛡️ 安全配置

### 环境变量安全

1. **敏感信息**: 所有 API 密钥都通过环境变量配置
2. **访问控制**: 使用 Vercel 的访问控制功能
3. **HTTPS**: 自动启用 HTTPS

### 速率限制

```typescript
// 在 API 路由中实现
const rateLimitStore = new Map()

function checkRateLimit(ip: string) {
  const now = Date.now()
  const windowMs = 60 * 1000 // 1 minute
  const maxRequests = 10

  // 实现速率限制逻辑
}
```

## 📊 监控和分析

### 内置监控

Vercel 提供：
- **函数日志**: 实时查看 API 调用日志
- **性能指标**: 响应时间和错误率
- **使用统计**: 带宽和函数调用次数

### 自定义监控

```typescript
// 添加自定义日志
console.log('Prompt generated:', {
  type: inputType,
  timestamp: new Date().toISOString(),
  success: true
})
```

## 🔄 持续部署

### Git 集成

1. **自动部署**: 推送到 main 分支自动部署
2. **预览部署**: PR 自动创建预览环境
3. **回滚**: 一键回滚到之前版本

### 部署钩子

```bash
# 部署前钩子
npm run build

# 部署后钩子
npm run post-deploy
```

## 🐛 故障排除

### 常见问题

#### 1. API 超时
```
Error: Function execution timed out
```
**解决方案**: 优化 API 逻辑，减少执行时间

#### 2. 内存不足
```
Error: Function exceeded memory limit
```
**解决方案**: 优化内存使用，考虑升级计划

#### 3. 环境变量未找到
```
Error: GEMINI_API_KEY is not defined
```
**解决方案**: 检查 Vercel 控制台中的环境变量配置

### 调试技巧

1. **查看日志**: Vercel 控制台 > Functions 标签
2. **本地测试**: `vercel dev` 本地运行
3. **预览部署**: 使用 PR 预览功能测试

## 📈 性能优化

### 代码分割

```typescript
// 动态导入
const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>
})
```

### 图片优化

```typescript
import Image from 'next/image'

<Image
  src="/image.jpg"
  alt="Description"
  width={500}
  height={300}
  priority
/>
```

### 缓存策略

```typescript
// API 响应缓存
export const revalidate = 3600 // 1 hour
```

## 💰 成本优化

### Hobby 计划限制
- 100GB 带宽/月
- 100 个 Serverless 函数调用/天
- 10 秒函数执行时间

### Pro 计划特性
- 1TB 带宽/月
- 无限函数调用
- 30 秒函数执行时间
- 自定义域名

## 📞 获取帮助

- **Vercel 文档**: [vercel.com/docs](https://vercel.com/docs)
- **社区论坛**: [github.com/vercel/vercel/discussions](https://github.com/vercel/vercel/discussions)
- **技术支持**: [vercel.com/support](https://vercel.com/support)

---

🎉 恭喜！你的 Veo3 Prompt Generator 现在已经部署到 Vercel 上了！