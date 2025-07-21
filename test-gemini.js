#!/usr/bin/env node

// Simple test script for Gemini API integration
const { GoogleGenerativeAI } = require('@google/generative-ai')

// Test configuration
const TEST_API_KEY = process.env.GEMINI_API_KEY || 'your-api-key-here'
const TEST_PROMPTS = [
  {
    name: '纯文本测试',
    input: '一只可爱的橘猫在阳光明媚的花园里追逐蝴蝶',
    type: 'text'
  },
  {
    name: '创意场景测试',
    input: '未来城市的夜景，霓虹灯闪烁，飞行汽车穿梭',
    type: 'text'
  },
  {
    name: '自然风景测试',
    input: '雪山脚下的湖泊，倒影清晰，微风轻拂',
    type: 'text'
  }
]

// Initialize Gemini
let genAI, model

try {
  genAI = new GoogleGenerativeAI(TEST_API_KEY)
  model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  console.log('✅ Gemini API 初始化成功')
} catch (error) {
  console.error('❌ Gemini API 初始化失败:', error.message)
  process.exit(1)
}

// Generate Veo3 Prompt function
async function generateVeo3Prompt(inputText) {
  const systemPrompt = `You are an expert at creating optimized prompts for Veo3, Google's advanced video generation AI. 

Your task is to transform user input into two versions of Veo3-optimized prompts:
1. SHORT version (50-100 words): Concise, essential elements only
2. LONG version (150-300 words): Detailed, comprehensive description

Key guidelines for Veo3 prompts:
- Use clear, descriptive language
- Include camera movements, lighting, and visual style
- Specify duration and pacing when relevant
- Mention specific visual details and atmosphere
- Use cinematic terminology
- Avoid abstract concepts, focus on visual elements
- Include technical aspects like shot types, angles

Respond in JSON format with "short" and "long" keys.

User input: ${inputText}`

  try {
    console.log(`🔄 正在生成 Prompt...`)
    
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      throw new Error('No response from Gemini')
    }

    console.log(`📝 原始响应:`)
    console.log(content)
    console.log(`\n${'='.repeat(50)}\n`)

    // Try to parse JSON response
    let parsed
    try {
      // Extract JSON from response if it's wrapped in markdown
      const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
      parsed = JSON.parse(jsonStr)
    } catch (parseError) {
      console.log(`⚠️  JSON 解析失败，尝试手动提取...`)
      
      // If JSON parsing fails, try to extract short and long versions manually
      const shortMatch = content.match(/(?:short|简洁版本?)[:：]\s*([^\n]+)/i)
      const longMatch = content.match(/(?:long|详细版本?)[:：]\s*([\s\S]*?)(?=\n\n|\n(?:short|long|简洁|详细)|$)/i)
      
      parsed = {
        short: shortMatch ? shortMatch[1].trim() : content.substring(0, 100) + '...',
        long: longMatch ? longMatch[1].trim() : content
      }
    }

    return {
      short: parsed.short || '',
      long: parsed.long || ''
    }
  } catch (error) {
    console.error('❌ Gemini API 错误:', error.message)
    throw error
  }
}

// Test function
async function runTests() {
  console.log('🚀 开始测试 Gemini API 集成...\n')

  if (TEST_API_KEY === 'your-api-key-here') {
    console.error('❌ 请设置 GEMINI_API_KEY 环境变量')
    console.log('获取 API Key: https://aistudio.google.com/')
    console.log('设置方法: export GEMINI_API_KEY=your_actual_api_key')
    process.exit(1)
  }

  let successCount = 0
  let totalTests = TEST_PROMPTS.length

  for (let i = 0; i < TEST_PROMPTS.length; i++) {
    const test = TEST_PROMPTS[i]
    console.log(`📋 测试 ${i + 1}/${totalTests}: ${test.name}`)
    console.log(`📝 输入: ${test.input}`)
    
    try {
      const startTime = Date.now()
      const result = await generateVeo3Prompt(test.input)
      const endTime = Date.now()
      
      console.log(`✅ 生成成功 (${endTime - startTime}ms)`)
      console.log(`📏 简洁版本 (${result.short.length} 字符):`)
      console.log(`   ${result.short}`)
      console.log(`📖 详细版本 (${result.long.length} 字符):`)
      console.log(`   ${result.long}`)
      
      successCount++
    } catch (error) {
      console.error(`❌ 测试失败:`, error.message)
    }
    
    console.log(`\n${'='.repeat(80)}\n`)
    
    // Add delay between requests to avoid rate limiting
    if (i < TEST_PROMPTS.length - 1) {
      console.log('⏳ 等待 2 秒避免速率限制...')
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
  }

  // Test summary
  console.log(`🎯 测试完成!`)
  console.log(`✅ 成功: ${successCount}/${totalTests}`)
  console.log(`❌ 失败: ${totalTests - successCount}/${totalTests}`)
  
  if (successCount === totalTests) {
    console.log(`🎉 所有测试通过! Gemini API 集成正常工作.`)
  } else {
    console.log(`⚠️  部分测试失败，请检查 API 配置.`)
  }
}

// API Key validation test
async function testApiKey() {
  console.log('🔑 测试 API Key 有效性...')
  
  try {
    const result = await model.generateContent('Hello, test message')
    const response = await result.response
    const text = response.text()
    
    if (text) {
      console.log('✅ API Key 有效')
      return true
    } else {
      console.log('❌ API Key 无效或无响应')
      return false
    }
  } catch (error) {
    console.error('❌ API Key 测试失败:', error.message)
    return false
  }
}

// Main execution
async function main() {
  console.log('🧪 Veo3 Prompt Generator - Gemini API 测试')
  console.log('=' .repeat(50))
  
  // Test API key first
  const isValidKey = await testApiKey()
  if (!isValidKey) {
    console.log('\n📋 获取 Gemini API Key 步骤:')
    console.log('1. 访问 https://aistudio.google.com/')
    console.log('2. 登录 Google 账户')
    console.log('3. 点击 "Get API key"')
    console.log('4. 创建新的 API key')
    console.log('5. 设置环境变量: export GEMINI_API_KEY=your_api_key')
    process.exit(1)
  }
  
  console.log('')
  await runTests()
}

// Handle errors
process.on('unhandledRejection', (error) => {
  console.error('❌ 未处理的错误:', error)
  process.exit(1)
})

// Run the test
main().catch(console.error)