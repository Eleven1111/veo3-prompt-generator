# GitHub 上传指南

## 🚀 将项目上传到 GitHub

### 方法一：使用 GitHub CLI（推荐）

#### 1. 安装 GitHub CLI
```bash
# macOS
brew install gh

# Windows (使用 Chocolatey)
choco install gh

# 或者从 https://cli.github.com/ 下载
```

#### 2. 登录 GitHub
```bash
gh auth login
```

#### 3. 初始化并上传项目
```bash
# 在项目根目录执行
git init
git add .
git commit -m "feat: initial commit - Veo3 Prompt Generator"

# 创建 GitHub 仓库并推送
gh repo create veo3-prompt-generator --public --source=. --remote=origin --push
```

### 方法二：使用 Git 命令行

#### 1. 在 GitHub 网站创建仓库
1. 访问 [GitHub](https://github.com)
2. 点击右上角的 "+" 按钮
3. 选择 "New repository"
4. 填写仓库信息：
   - Repository name: `veo3-prompt-generator`
   - Description: `AI-powered Veo3 prompt generator with admin dashboard`
   - 选择 Public 或 Private
   - 不要初始化 README（我们已经有了）
5. 点击 "Create repository"

#### 2. 本地初始化并推送
```bash
# 在项目根目录执行
git init
git add .
git commit -m "feat: initial commit - Veo3 Prompt Generator"

# 添加远程仓库（替换为你的用户名）
git remote add origin https://github.com/yourusername/veo3-prompt-generator.git

# 推送到 GitHub
git branch -M main
git push -u origin main
```

### 方法三：使用 GitHub Desktop

1. 下载并安装 [GitHub Desktop](https://desktop.github.com/)
2. 登录你的 GitHub 账户
3. 点击 "Add an Existing Repository from your Hard Drive"
4. 选择项目文件夹
5. 点击 "Publish repository"
6. 填写仓库名称和描述
7. 选择是否公开
8. 点击 "Publish Repository"

## 📋 上传前检查清单

在上传之前，确保：

- [ ] 已创建 `.gitignore` 文件
- [ ] 已删除敏感信息（API 密钥等）
- [ ] 已创建 `README.md` 文件
- [ ] 已添加 `LICENSE` 文件
- [ ] 项目可以正常构建
- [ ] 文档是最新的

## 🔐 环境变量安全

**重要**：不要将敏感信息上传到 GitHub！

### 检查敏感文件
```bash
# 检查是否有敏感文件
find . -name "*.env*" -not -path "./node_modules/*"
find . -name "*.key" -not -path "./node_modules/*"
find . -name "*.pem" -not -path "./node_modules/*"
```

### 如果意外上传了敏感信息
```bash
# 从历史记录中删除敏感文件
git filter-branch --force --index-filter \
  'git rm --cached --ignore-unmatch .env' \
  --prune-empty --tag-name-filter cat -- --all

# 强制推送
git push origin --force --all
```

## 🏷️ 创建第一个 Release

```bash
# 创建标签
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# 或使用 GitHub CLI
gh release create v1.0.0 --title "v1.0.0" --notes "Initial release of Veo3 Prompt Generator"
```

## 🔧 设置 GitHub Actions

项目已包含 CI/CD 配置文件 `.github/workflows/ci.yml`。

需要在 GitHub 仓库设置中添加以下 Secrets：

1. 进入仓库设置
2. 点击 "Secrets and variables" > "Actions"
3. 添加以下 secrets：
   - `VERCEL_TOKEN`: Vercel 部署令牌
   - `GEMINI_API_KEY`: Google Gemini API 密钥（用于测试）

## 📊 启用 GitHub Pages（可选）

如果想要启用文档页面：

1. 进入仓库设置
2. 滚动到 "Pages" 部分
3. 选择源分支（通常是 `main`）
4. 选择文件夹（`/ (root)` 或 `/docs`）
5. 点击 "Save"

## 🤝 设置协作

### 添加协作者
1. 进入仓库设置
2. 点击 "Manage access"
3. 点击 "Invite a collaborator"
4. 输入用户名或邮箱
5. 选择权限级别
6. 发送邀请

### 设置分支保护
1. 进入仓库设置
2. 点击 "Branches"
3. 点击 "Add rule"
4. 设置规则：
   - Branch name pattern: `main`
   - ✅ Require pull request reviews before merging
   - ✅ Require status checks to pass before merging
   - ✅ Require branches to be up to date before merging

## 📈 GitHub 仓库优化

### 添加仓库主题
在仓库主页点击设置图标，添加相关主题：
- `veo3`
- `prompt-generator`
- `ai`
- `nextjs`
- `typescript`
- `video-generation`

### 设置仓库描述
```
🎯 AI-powered Veo3 prompt generator with admin dashboard. Transform your creative ideas into optimized video generation prompts.
```

### 添加仓库链接
- Website: 你的 Vercel 部署链接
- Documentation: GitHub Pages 链接（如果有）

## 🔍 验证上传

上传完成后，检查：

1. **文件完整性**：确保所有文件都已上传
2. **README 显示**：检查 README 是否正确显示
3. **Actions 运行**：查看 GitHub Actions 是否正常运行
4. **Issues 模板**：测试 Issue 模板是否工作
5. **PR 模板**：创建测试 PR 检查模板

## 📞 获取帮助

如果遇到问题：

1. 查看 [GitHub 文档](https://docs.github.com/)
2. 使用 `git --help` 查看帮助
3. 查看 [GitHub Community](https://github.community/)

## 🎉 完成！

恭喜！你的 Veo3 Prompt Generator 项目现在已经在 GitHub 上了！

下一步可以：
1. 设置 Vercel 自动部署
2. 邀请协作者
3. 开始接受贡献
4. 推广你的项目

---

**快速命令参考**：

```bash
# 克隆仓库
git clone https://github.com/yourusername/veo3-prompt-generator.git

# 查看状态
git status

# 添加文件
git add .

# 提交更改
git commit -m "your message"

# 推送更改
git push origin main

# 拉取更新
git pull origin main
```