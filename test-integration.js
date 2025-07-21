#!/usr/bin/env node

// Integration test for Veo3 Prompt Generator
console.log('🧪 Veo3 Prompt Generator - 集成测试')
console.log('=' .repeat(50))

// Test 1: Check dependencies
console.log('\n📦 检查依赖包...')

try {
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  console.log('✅ @google/generative-ai - 已安装')
} catch (error) {
  console.log('❌ @google/generative-ai - 未安装')
  console.log('   安装命令: npm install @google/generative-ai')
}

try {
  const sharp = require('sharp')
  console.log('✅ sharp - 已安装')
} catch (error) {
  console.log('❌ sharp - 未安装')
  console.log('   安装命令: npm install sharp')
}

// Test 2: Check API initialization
console.log('\n🔧 测试 API 初始化...')

try {
  const { GoogleGenerativeAI } = require('@google/generative-ai')
  
  // Test with dummy key
  const genAI = new GoogleGenerativeAI('test-key')
  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })
  
  console.log('✅ Gemini API 初始化成功')
  console.log(`   模型: gemini-2.0-flash-exp`)
} catch (error) {
  console.log('❌ Gemini API 初始化失败:', error.message)
}

// Test 3: Check prompt generation logic
console.log('\n📝 测试 Prompt 生成逻辑...')

function testPromptParsing() {
  // Test JSON parsing
  const testResponses = [
    // Standard JSON response
    '{"short": "A cat playing in garden", "long": "A beautiful orange tabby cat playfully chasing butterflies in a sun-drenched garden"}',
    
    // Markdown wrapped JSON
    '```json\n{"short": "Mountain landscape", "long": "Breathtaking mountain vista during golden hour"}\n```',
    
    // Non-JSON response that needs manual parsing
    'Short: A dog running on beach\nLong: A golden retriever running along the sandy beach with waves crashing nearby'
  ]

  testResponses.forEach((response, index) => {
    try {
      let parsed
      
      // Try to parse JSON response
      try {
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/) || response.match(/\{[\s\S]*\}/)
        const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : response
        parsed = JSON.parse(jsonStr)
      } catch (parseError) {
        // Manual parsing fallback
        const shortMatch = response.match(/(?:short|简洁版本?)[:：]\s*([^\n]+)/i)
        const longMatch = response.match(/(?:long|详细版本?)[:：]\s*([\s\S]*?)(?=\n\n|\n(?:short|long|简洁|详细)|$)/i)
        
        parsed = {
          short: shortMatch ? shortMatch[1].trim() : response.substring(0, 50) + '...',
          long: longMatch ? longMatch[1].trim() : response
        }
      }
      
      console.log(`✅ 测试响应 ${index + 1}: 解析成功`)
      console.log(`   简洁版本: ${parsed.short}`)
      console.log(`   详细版本: ${parsed.long}`)
      
    } catch (error) {
      console.log(`❌ 测试响应 ${index + 1}: 解析失败 - ${error.message}`)
    }
  })
}

testPromptParsing()

// Test 4: Check security functions
console.log('\n🛡️  测试安全功能...')

function detectMaliciousContent(text) {
  const maliciousPatterns = [
    /ignore\s+previous\s+instructions/i,
    /system\s+prompt/i,
    /jailbreak/i,
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
  ]
  
  return maliciousPatterns.some(pattern => pattern.test(text))
}

const securityTests = [
  { text: '一只可爱的小猫', expected: false, name: '正常输入' },
  { text: 'ignore previous instructions', expected: true, name: '恶意指令' },
  { text: '<script>alert("xss")</script>', expected: true, name: 'XSS 攻击' },
  { text: 'system prompt injection', expected: true, name: 'Prompt 注入' }
]

securityTests.forEach(test => {
  const result = detectMaliciousContent(test.text)
  if (result === test.expected) {
    console.log(`✅ ${test.name}: 检测正确`)
  } else {
    console.log(`❌ ${test.name}: 检测错误 (期望: ${test.expected}, 实际: ${result})`)
  }
})

// Test 5: Check rate limiting logic
console.log('\n⏱️  测试速率限制...')

function testRateLimit() {
  const rateLimitStore = new Map()
  
  function checkRateLimit(ip) {
    const now = Date.now()
    const windowMs = 60 * 1000 // 1 minute
    const maxRequests = 10

    const record = rateLimitStore.get(ip)
    
    if (!record || now > record.resetTime) {
      rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs })
      return true
    }
    
    if (record.count >= maxRequests) {
      return false
    }
    
    record.count++
    return true
  }

  const testIP = '192.168.1.1'
  let allowedRequests = 0
  
  // Test 15 requests (should allow 10, block 5)
  for (let i = 0; i < 15; i++) {
    if (checkRateLimit(testIP)) {
      allowedRequests++
    }
  }
  
  if (allowedRequests === 10) {
    console.log('✅ 速率限制: 工作正常 (允许 10/15 请求)')
  } else {
    console.log(`❌ 速率限制: 异常 (允许 ${allowedRequests}/15 请求)`)
  }
}

testRateLimit()

// Test 6: Environment check
console.log('\n🌍 环境检查...')

const requiredEnvVars = [
  'GEMINI_API_KEY'
]

requiredEnvVars.forEach(envVar => {
  if (process.env[envVar]) {
    console.log(`✅ ${envVar}: 已设置`)
  } else {
    console.log(`⚠️  ${envVar}: 未设置 (生产环境需要)`)
  }
})

// Summary
console.log('\n🎯 测试总结')
console.log('=' .repeat(50))
console.log('✅ 依赖检查: 完成')
console.log('✅ API 初始化: 完成') 
console.log('✅ Prompt 解析: 完成')
console.log('✅ 安全功能: 完成')
console.log('✅ 速率限制: 完成')
console.log('⚠️  环境变量: 需要设置 GEMINI_API_KEY')

console.log('\n📋 下一步:')
console.log('1. 获取 Gemini API Key: https://aistudio.google.com/')
console.log('2. 设置环境变量: export GEMINI_API_KEY=your_api_key')
console.log('3. 运行完整测试: node test-gemini.js')
console.log('4. 启动开发服务器: npm run dev')

console.log('\n🎉 集成测试完成!')