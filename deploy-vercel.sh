#!/bin/bash

# Vercel 一键部署脚本
echo "🚀 开始部署到 Vercel..."

# 检查是否在项目根目录
if [ ! -f "package.json" ]; then
    echo "❌ 错误：请在项目根目录运行此脚本"
    exit 1
fi

# 检查是否安装 Vercel CLI
if ! command -v vercel &> /dev/null; then
    echo "📦 正在安装 Vercel CLI..."
    npm install -g vercel
fi

echo "📁 切换到 client 目录..."
cd client

# 检查环境变量
if [ -z "$GEMINI_API_KEY" ]; then
    echo "⚠️  警告：GEMINI_API_KEY 环境变量未设置"
    echo "💡 请在 Vercel 控制台设置此环境变量"
fi

echo "🔧 开始部署..."
if [ "$1" = "prod" ]; then
    vercel --prod
else
    vercel
fi

echo "✅ 部署完成！"
echo "🔗 访问控制台：https://vercel.com/dashboard"