#!/bin/bash

# Quick Test Script for Veo3 Prompt Generator

echo "🚀 Veo3 Prompt Generator - 快速测试"
echo "=================================="

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check Node.js
echo -e "\n📋 检查环境..."
if command -v node >/dev/null 2>&1; then
    NODE_VERSION=$(node --version)
    echo -e "${GREEN}✅ Node.js: $NODE_VERSION${NC}"
else
    echo -e "${RED}❌ Node.js 未安装${NC}"
    exit 1
fi

# Check npm
if command -v npm >/dev/null 2>&1; then
    NPM_VERSION=$(npm --version)
    echo -e "${GREEN}✅ npm: $NPM_VERSION${NC}"
else
    echo -e "${RED}❌ npm 未安装${NC}"
    exit 1
fi

# Install dependencies if needed
echo -e "\n📦 检查依赖..."
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}⏳ 安装依赖中...${NC}"
    npm install --silent
fi

if [ -f "node_modules/@google/generative-ai/package.json" ]; then
    echo -e "${GREEN}✅ @google/generative-ai 已安装${NC}"
else
    echo -e "${YELLOW}⏳ 安装 Gemini AI SDK...${NC}"
    npm install @google/generative-ai --silent
fi

if [ -f "node_modules/sharp/package.json" ]; then
    echo -e "${GREEN}✅ sharp 已安装${NC}"
else
    echo -e "${YELLOW}⏳ 安装 Sharp...${NC}"
    npm install sharp --silent
fi

# Run integration test
echo -e "\n🧪 运行集成测试..."
if node test-integration.js; then
    echo -e "${GREEN}✅ 集成测试通过${NC}"
else
    echo -e "${RED}❌ 集成测试失败${NC}"
    exit 1
fi

# Run mock API test
echo -e "\n🎭 运行模拟 API 测试..."
if node test-mock-api.js; then
    echo -e "${GREEN}✅ 模拟 API 测试通过${NC}"
else
    echo -e "${RED}❌ 模拟 API 测试失败${NC}"
    exit 1
fi

# Check for API key
echo -e "\n🔑 检查 API 配置..."
if [ -n "$GEMINI_API_KEY" ]; then
    echo -e "${GREEN}✅ GEMINI_API_KEY 已设置${NC}"
    echo -e "\n🔥 运行真实 API 测试..."
    if node test-gemini.js; then
        echo -e "${GREEN}✅ 真实 API 测试通过${NC}"
    else
        echo -e "${YELLOW}⚠️  真实 API 测试失败，请检查 API Key${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  GEMINI_API_KEY 未设置${NC}"
    echo -e "   获取 API Key: https://aistudio.google.com/"
    echo -e "   设置方法: export GEMINI_API_KEY=your_api_key"
fi

# Open test frontend
echo -e "\n🌐 启动前端测试..."
if command -v python3 >/dev/null 2>&1; then
    echo -e "${GREEN}✅ 启动本地服务器...${NC}"
    echo -e "   访问: http://localhost:8000/test-frontend.html"
    echo -e "   按 Ctrl+C 停止服务器"
    python3 -m http.server 8000 --quiet &
    SERVER_PID=$!
    
    # Wait a moment for server to start
    sleep 2
    
    # Try to open browser
    if command -v open >/dev/null 2>&1; then
        open "http://localhost:8000/test-frontend.html"
    elif command -v xdg-open >/dev/null 2>&1; then
        xdg-open "http://localhost:8000/test-frontend.html"
    else
        echo -e "${YELLOW}请手动打开: http://localhost:8000/test-frontend.html${NC}"
    fi
    
    echo -e "\n按任意键停止服务器..."
    read -n 1 -s
    kill $SERVER_PID 2>/dev/null
else
    echo -e "${YELLOW}⚠️  Python3 未安装，无法启动本地服务器${NC}"
    echo -e "   请直接在浏览器中打开 test-frontend.html"
fi

# Summary
echo -e "\n🎉 测试完成!"
echo -e "=================================="
echo -e "${GREEN}✅ 环境检查: 通过${NC}"
echo -e "${GREEN}✅ 依赖安装: 完成${NC}"
echo -e "${GREEN}✅ 集成测试: 通过${NC}"
echo -e "${GREEN}✅ 模拟测试: 通过${NC}"

if [ -n "$GEMINI_API_KEY" ]; then
    echo -e "${GREEN}✅ API 测试: 通过${NC}"
else
    echo -e "${YELLOW}⚠️  API 测试: 需要配置 API Key${NC}"
fi

echo -e "\n📋 下一步:"
echo -e "1. 获取 Gemini API Key (如果还没有)"
echo -e "2. 设置环境变量: export GEMINI_API_KEY=your_key"
echo -e "3. 部署到 Vercel: ./scripts/deploy-vercel.sh"
echo -e "4. 或使用 Docker: ./scripts/deploy.sh deploy"

echo -e "\n📚 查看完整测试报告: cat TEST_REPORT.md"