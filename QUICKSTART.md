# Veo3 Prompt Generator - 快速启动指南

## 🚀 5分钟快速部署

### 1. 准备工作

确保您的系统已安装：
- Docker 和 Docker Compose
- Git
- 一个 Google Gemini API Key

### 2. 克隆和配置

```bash
# 克隆项目
git clone https://github.com/yourusername/veo3-prompt-generator.git
cd veo3-prompt-generator

# 配置环境变量
cp .env.example .env
```

编辑 `.env` 文件，至少需要设置：
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. 一键部署

```bash
# 使用部署脚本
chmod +x scripts/deploy.sh
./scripts/deploy.sh deploy
```

### 4. 访问应用

- 前端：http://localhost:3000
- 管理后台：http://localhost:3000/admin
- API：http://localhost:3001

## 📝 使用示例

### 示例 1：纯文本输入

**输入**：
```
一只可爱的橘猫在阳光明媚的花园里追逐蝴蝶，慢镜头拍摄，温暖的光线
```

**输出**：
- **简洁版本**：Orange tabby cat chasing butterflies in sunny garden, slow motion, warm lighting
- **详细版本**：A charming orange tabby cat playfully chasing colorful butterflies through a sun-drenched garden filled with blooming flowers. Shot in slow motion with warm, golden hour lighting creating a dreamy atmosphere. Camera follows the cat's graceful movements with smooth tracking shots.

### 示例 2：文本+图片输入

**文本输入**：
```
根据这张图片创建一个科幻风格的视频，添加未来感的特效
```

**图片**：上传一张城市天际线图片

**输出**：
- **简洁版本**：Futuristic cityscape with sci-fi effects, neon lights, flying vehicles
- **详细版本**：Transform this urban skyline into a futuristic metropolis with holographic advertisements, flying vehicles, neon lighting effects, and atmospheric fog. Add particle effects and lens flares to enhance the sci-fi aesthetic. Camera movement: slow pan across the cityscape with occasional zoom-ins on futuristic elements.

### 示例 3：纯图片输入

**操作**：上传一张自然风景图片

**输出**：
- **简洁版本**：Serene mountain landscape, golden hour, cinematic wide shot
- **详细版本**：Breathtaking mountain vista during golden hour with dramatic cloud formations and warm sunlight filtering through peaks. Cinematic wide-angle shot with slow camera movement revealing the grandeur of the landscape. Enhanced with color grading to emphasize the warm tones and natural beauty.

## 🛠️ 常用命令

```bash
# 查看服务状态
./scripts/deploy.sh monitor

# 查看日志
./scripts/deploy.sh logs

# 重启服务
./scripts/deploy.sh restart

# 更新应用
./scripts/deploy.sh update

# 创建备份
./scripts/deploy.sh backup

# 清理系统
./scripts/deploy.sh cleanup
```

## 🔧 开发模式

如果您想进行开发或自定义：

```bash
# 安装依赖
npm run install:all

# 启动开发服务器
npm run dev

# 前端：http://localhost:3000
# 后端：http://localhost:3001
```

## 📊 管理后台功能

访问 http://localhost:3000/admin 查看：

- **用户统计**：总用户数、活跃用户、新增用户
- **使用情况**：Prompt 生成量、成功率、响应时间
- **输入分析**：文本、图片、混合输入的使用比例
- **安全监控**：威胁检测、异常访问、系统状态
- **数据导出**：用户数据、使用日志、统计报告

## 🛡️ 安全特性

本系统内置多层安全防护：

- **输入验证**：自动检测恶意内容和 Prompt 注入
- **速率限制**：防止 API 滥用和 DDoS 攻击
- **文件安全**：图片格式验证和元数据清理
- **网络安全**：HTTPS、CORS、CSRF 防护
- **监控告警**：实时安全事件监控

## 🔍 故障排除

### 常见问题

**Q: Gemini API 调用失败**
A: 检查 API Key 是否正确，API 配额是否充足

**Q: 数据库连接失败**
A: 确认 PostgreSQL 容器正在运行：`docker-compose ps`

**Q: 图片上传失败**
A: 检查文件大小（<5MB）和格式（JPG/PNG/WebP）

**Q: 前端页面无法访问**
A: 检查端口是否被占用，尝试重启服务

### 获取帮助

- 查看详细日志：`./scripts/deploy.sh logs`
- 检查服务状态：`docker-compose ps`
- 重启所有服务：`./scripts/deploy.sh restart`

## 📞 技术支持

如需帮助，请：
1. 查看 [完整文档](README.md)
2. 提交 [GitHub Issue](https://github.com/yourusername/veo3-prompt-generator/issues)
3. 联系技术支持：support@yourdomain.com

---

🎉 恭喜！您的 Veo3 Prompt Generator 已经成功部署并运行！