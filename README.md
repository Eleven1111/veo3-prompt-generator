# Veo3 Prompt Generator

一个功能完整、安全可靠的 Veo3 视频生成 Prompt 转换平台，支持多种输入方式，自动生成优化的 Prompt，并提供完整的管理后台。

## ✨ 功能特性

### 核心功能
- 🎯 **智能 Prompt 生成**：支持文本、文本+图片、纯图片三种输入方式
- 📏 **双版本输出**：自动生成长版本（详细）和短版本（简洁）两种 Prompt
- 🔄 **重新生成**：不满意可一键重新生成，无需重新输入
- 🖼️ **图片处理**：自动优化图片大小和格式，移除敏感元数据
- 📱 **响应式设计**：完美适配桌面端和移动端

### 安全防护
- 🛡️ **多层安全防护**：防爬虫、防 DDoS、防 Prompt 注入攻击
- 🚫 **恶意内容检测**：自动识别和阻止恶意输入内容
- 🔒 **输入验证**：严格的输入验证和内容过滤
- 📊 **实时监控**：安全事件实时监控和告警
- 🔐 **数据加密**：敏感数据加密存储和传输

### 管理后台
- 📊 **数据统计**：完整的用户行为和使用情况统计
- 📈 **可视化图表**：直观的数据展示和趋势分析
- 🔍 **日志管理**：详细的操作日志和安全日志
- 👥 **用户管理**：用户行为分析和管理功能
- 📤 **数据导出**：支持多种格式的数据导出

### SEO 优化
- 🚀 **完整 SEO 架构**：优化的页面结构和元数据
- 🔍 **搜索引擎友好**：结构化数据和语义化标签
- ⚡ **性能优化**：图片优化、代码分割、缓存策略
- 📱 **移动端优化**：移动端 SEO 和用户体验优化

## 🛠️ 技术栈

### 前端技术
- **框架**: Next.js 14 (React 18)
- **语言**: TypeScript
- **样式**: Tailwind CSS
- **状态管理**: React Query
- **动画**: Framer Motion
- **图表**: Recharts
- **表单**: React Hook Form

### 后端技术
- **运行时**: Node.js
- **框架**: Express.js
- **语言**: TypeScript
- **数据库**: PostgreSQL
- **缓存**: Redis
- **文件处理**: Sharp, Multer
- **AI 集成**: Google Gemini 2.0 Flash

### 安全技术
- **Web 安全**: Helmet.js
- **速率限制**: Express Rate Limit
- **输入验证**: Joi, Express Validator
- **加密**: bcryptjs, JWT
- **监控**: Winston Logger

### 部署技术
- **容器化**: Docker, Docker Compose
- **反向代理**: Nginx
- **SSL/TLS**: Let's Encrypt
- **监控**: 自定义监控脚本

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js 18+
- Docker & Docker Compose
- Git

### 2. 克隆项目

```bash
git clone https://github.com/yourusername/veo3-prompt-generator.git
cd veo3-prompt-generator
```

### 3. 环境配置

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑环境变量（重要！）
nano .env
```

必须配置的环境变量：
```env
# Google Gemini API Key (必须)
GEMINI_API_KEY=your_gemini_api_key_here

# 数据库配置
DATABASE_URL=postgresql://veo3_user:veo3_password@localhost:5432/veo3_prompts

# Redis 配置
REDIS_URL=redis://localhost:6379

# 安全配置
JWT_SECRET=your_jwt_secret_here
ADMIN_PASSWORD=your_secure_admin_password
```

**📋 获取 Gemini API Key**: 查看 [Gemini API 设置指南](GEMINI_API_SETUP.md) 了解如何获取免费的 API 密钥。

### 4. 一键部署

```bash
# 使用部署脚本（推荐）
./scripts/deploy.sh deploy

# 或者手动部署
docker-compose up -d
```

### 5. 访问应用

- **前端应用**: http://localhost:3000
- **管理后台**: http://localhost:3000/admin
- **API 文档**: http://localhost:3001/api/health

## 📖 使用指南

### 用户端使用

1. **选择输入方式**
   - 纯文本：直接输入创意描述
   - 文本+图片：文字描述配合参考图片
   - 纯图片：仅上传参考图片

2. **输入创意内容**
   - 文本描述：详细描述您想要的视频内容
   - 图片上传：支持 JPG、PNG、WebP 格式，最大 5MB

3. **生成 Prompt**
   - 点击"生成 Veo3 Prompt"按钮
   - 系统自动生成长短两个版本
   - 可一键复制到剪贴板

4. **重新生成**
   - 如不满意可点击"重新生成"
   - 无需重新输入内容

### 管理后台使用

1. **访问后台**
   - 访问 `/admin` 路径
   - 使用配置的管理员账号登录

2. **数据统计**
   - 查看用户数量、Prompt 生成量等统计数据
   - 分析用户行为和使用趋势

3. **安全监控**
   - 查看安全事件和威胁等级
   - 监控系统运行状态

4. **日志管理**
   - 查看详细的操作日志
   - 导出日志数据进行分析

## 🔧 开发指南

### 开发环境设置

```bash
# 安装所有依赖
npm run install:all

# 启动开发服务器
npm run dev

# 前端开发服务器
npm run dev:client

# 后端开发服务器
npm run dev:server
```

### 项目结构

```
veo3-prompt-generator/
├── client/                 # Next.js 前端应用
│   ├── src/
│   │   ├── app/           # App Router 页面
│   │   └── components/    # React 组件
│   ├── public/            # 静态资源
│   └── Dockerfile         # 前端 Docker 配置
├── server/                # Express 后端应用
│   ├── src/               # TypeScript 源码
│   ├── database/          # 数据库脚本
│   ├── uploads/           # 文件上传目录
│   └── Dockerfile         # 后端 Docker 配置
├── scripts/               # 部署和维护脚本
├── nginx.conf             # Nginx 配置
├── docker-compose.yml     # Docker Compose 配置
└── .env.example          # 环境变量模板
```

### API 接口

#### 生成 Prompt
```http
POST /api/generate-prompt
Content-Type: multipart/form-data

{
  "text": "创意描述",
  "type": "text|text-image|image",
  "image": File (可选)
}
```

#### 重新生成 Prompt
```http
POST /api/regenerate-prompt
Content-Type: application/json

{
  "promptId": "uuid"
}
```

#### 管理后台数据
```http
GET /api/admin/dashboard
Authorization: Bearer <token>
```

## 🛡️ 安全特性

### 输入安全
- **内容过滤**：自动检测和阻止恶意输入
- **文件验证**：严格的文件类型和大小限制
- **元数据清理**：自动移除图片敏感信息

### 网络安全
- **速率限制**：API 调用频率限制
- **CORS 保护**：跨域请求安全控制
- **CSRF 防护**：跨站请求伪造防护
- **XSS 防护**：跨站脚本攻击防护

### 数据安全
- **加密存储**：敏感数据加密存储
- **安全传输**：HTTPS 强制加密传输
- **访问控制**：基于角色的访问控制
- **审计日志**：完整的操作审计记录

### 系统安全
- **容器隔离**：Docker 容器安全隔离
- **最小权限**：最小权限原则运行
- **安全监控**：实时安全事件监控
- **自动备份**：定期数据备份

## 📊 监控和维护

### 系统监控

```bash
# 查看服务状态
./scripts/deploy.sh monitor

# 查看日志
./scripts/deploy.sh logs

# 安全监控
./scripts/security-monitor.sh
```

### 数据备份

```bash
# 创建数据库备份
./scripts/deploy.sh backup

# 自动备份（添加到 crontab）
0 2 * * * /path/to/scripts/deploy.sh backup
```

### 性能优化

- **数据库优化**：定期分析和优化查询
- **缓存策略**：Redis 缓存热点数据
- **CDN 加速**：静态资源 CDN 分发
- **图片优化**：自动图片压缩和格式转换

## 🔄 更新和升级

### 应用更新

```bash
# 更新应用
./scripts/deploy.sh update

# 重启服务
./scripts/deploy.sh restart
```

### 数据库迁移

```bash
# 连接数据库
docker-compose exec postgres psql -U veo3_user -d veo3_prompts

# 执行迁移脚本
\i /path/to/migration.sql
```

## 🐛 故障排除

### 常见问题

1. **Gemini API 错误**
   - 检查 API Key 是否正确
   - 确认 API 配额充足
   - 检查网络连接

2. **数据库连接失败**
   - 检查数据库服务是否运行
   - 验证连接字符串配置
   - 检查防火墙设置

3. **文件上传失败**
   - 检查文件大小限制
   - 验证文件格式支持
   - 确认上传目录权限

### 日志查看

```bash
# 查看应用日志
docker-compose logs -f server

# 查看 Nginx 日志
docker-compose logs -f nginx

# 查看数据库日志
docker-compose logs -f postgres
```

## 📄 许可证

本项目采用 MIT 许可证。详见 [LICENSE](LICENSE) 文件。

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

## 📞 支持和联系

- **问题反馈**: [GitHub Issues](https://github.com/yourusername/veo3-prompt-generator/issues)
- **功能建议**: [GitHub Discussions](https://github.com/yourusername/veo3-prompt-generator/discussions)
- **邮件联系**: support@yourdomain.com

---

**Veo3 Prompt Generator** - 让 AI 视频创作更简单、更安全、更高效！