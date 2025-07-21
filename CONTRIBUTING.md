# 贡献指南

感谢您对 Veo3 Prompt Generator 项目的关注！我们欢迎所有形式的贡献。

## 🤝 如何贡献

### 报告问题

如果您发现了 bug 或有功能建议：

1. 检查 [Issues](https://github.com/yourusername/veo3-prompt-generator/issues) 确保问题未被报告
2. 创建新的 Issue，包含：
   - 清晰的标题和描述
   - 重现步骤（如果是 bug）
   - 期望的行为
   - 实际的行为
   - 环境信息（浏览器、操作系统等）

### 提交代码

1. **Fork 仓库**
   ```bash
   # 点击 GitHub 页面上的 Fork 按钮
   ```

2. **克隆你的 Fork**
   ```bash
   git clone https://github.com/yourusername/veo3-prompt-generator.git
   cd veo3-prompt-generator
   ```

3. **创建功能分支**
   ```bash
   git checkout -b feature/amazing-feature
   ```

4. **安装依赖**
   ```bash
   npm run install:all
   ```

5. **进行更改**
   - 遵循现有的代码风格
   - 添加必要的测试
   - 更新文档

6. **测试更改**
   ```bash
   npm run lint
   npm run test
   npm run build
   ```

7. **提交更改**
   ```bash
   git add .
   git commit -m "feat: add amazing feature"
   ```

8. **推送到你的 Fork**
   ```bash
   git push origin feature/amazing-feature
   ```

9. **创建 Pull Request**
   - 在 GitHub 上创建 PR
   - 填写 PR 模板
   - 等待代码审查

## 📝 代码规范

### TypeScript/JavaScript

- 使用 TypeScript 进行类型安全
- 遵循 ESLint 配置
- 使用有意义的变量和函数名
- 添加适当的注释

### React/Next.js

- 使用函数组件和 Hooks
- 遵循 React 最佳实践
- 使用 TypeScript 接口定义 props

### 样式

- 使用 Tailwind CSS
- 保持响应式设计
- 遵循设计系统

### 提交信息

使用 [Conventional Commits](https://www.conventionalcommits.org/) 格式：

```
type(scope): description

[optional body]

[optional footer]
```

类型：
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式化
- `refactor`: 代码重构
- `test`: 测试相关
- `chore`: 构建过程或辅助工具的变动

示例：
```
feat(api): add prompt regeneration endpoint
fix(ui): resolve mobile layout issues
docs(readme): update installation instructions
```

## 🧪 测试

- 为新功能添加测试
- 确保所有测试通过
- 保持测试覆盖率

```bash
# 运行测试
npm run test

# 运行 lint
npm run lint
```

## 📚 文档

- 更新相关文档
- 添加 JSDoc 注释
- 更新 README 如果需要

## 🔍 代码审查

所有的 PR 都需要经过代码审查：

- 至少一个维护者的批准
- 所有检查必须通过
- 解决所有审查意见

## 🎯 开发环境设置

1. **环境要求**
   - Node.js 18+
   - npm 或 yarn
   - Git

2. **本地开发**
   ```bash
   # 安装依赖
   npm run install:all
   
   # 配置环境变量
   cp .env.example .env
   # 编辑 .env 文件
   
   # 启动开发服务器
   npm run dev
   ```

3. **Docker 开发**
   ```bash
   # 使用 Docker
   docker-compose up -d
   ```

## 🚀 发布流程

1. 更新版本号
2. 更新 CHANGELOG
3. 创建 Release PR
4. 合并后自动发布

## 📞 获取帮助

- 查看 [文档](README.md)
- 提交 [Issue](https://github.com/yourusername/veo3-prompt-generator/issues)
- 参与 [Discussions](https://github.com/yourusername/veo3-prompt-generator/discussions)

## 📋 Pull Request 模板

创建 PR 时请包含：

- [ ] 功能描述
- [ ] 相关 Issue 链接
- [ ] 测试说明
- [ ] 截图（如果是 UI 更改）
- [ ] 文档更新
- [ ] 破坏性更改说明

## 🏆 贡献者

感谢所有贡献者！

<!-- 这里会自动生成贡献者列表 -->

---

再次感谢您的贡献！🎉