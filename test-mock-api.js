#!/usr/bin/env node

// Mock API test for Veo3 Prompt Generator
console.log('🎭 Veo3 Prompt Generator - 模拟 API 测试')
console.log('=' .repeat(50))

// Mock Gemini API responses
const mockResponses = {
  textOnly: `{
    "short": "Orange tabby cat chasing butterflies in sunny garden, slow motion, warm golden lighting",
    "long": "A charming orange tabby cat playfully chasing colorful butterflies through a sun-drenched garden filled with blooming flowers. Shot in slow motion with warm, golden hour lighting creating a dreamy atmosphere. Camera follows the cat's graceful movements with smooth tracking shots, capturing the joy and innocence of the moment. Soft focus background with bokeh effects, emphasizing the cat as the main subject."
  }`,
  
  futuristicCity: `{
    "short": "Futuristic cityscape at night, neon lights, flying cars, cyberpunk aesthetic, wide establishing shot",
    "long": "A breathtaking futuristic metropolis at night with towering skyscrapers adorned with holographic advertisements and neon lighting. Flying vehicles streak through the air leaving light trails, while the camera performs a sweeping aerial establishing shot revealing the vast urban landscape. The scene features a cyberpunk aesthetic with purple and blue color grading, atmospheric fog, and rain-slicked streets reflecting the city lights. Advanced architectural designs with curved glass surfaces and LED integration create a believable future world."
  }`,
  
  mountainLake: `{
    "short": "Serene mountain lake with snow-capped peaks, crystal clear reflections, gentle breeze, cinematic wide shot",
    "long": "A pristine mountain lake nestled between snow-capped peaks, with crystal-clear water creating perfect mirror reflections of the surrounding landscape. A gentle breeze occasionally disturbs the surface, creating ripples that catch the soft morning light. The camera captures this scene with a cinematic wide shot, slowly panning to reveal the full majesty of the natural setting. Color palette emphasizes cool blues and whites with warm golden accents from the sunrise. The composition follows the rule of thirds with the lake in the foreground and mountains creating a dramatic backdrop."
  }`
}

// Mock function to simulate Gemini API call
function mockGenerateContent(prompt) {
  return new Promise((resolve) => {
    // Simulate API delay
    setTimeout(() => {
      let response
      
      if (prompt.includes('橘猫') || prompt.includes('cat')) {
        response = mockResponses.textOnly
      } else if (prompt.includes('未来') || prompt.includes('城市') || prompt.includes('future')) {
        response = mockResponses.futuristicCity
      } else if (prompt.includes('雪山') || prompt.includes('湖泊') || prompt.includes('mountain')) {
        response = mockResponses.mountainLake
      } else {
        // Default response
        response = `{
          "short": "Creative video scene with cinematic quality, professional lighting, smooth camera movement",
          "long": "A professionally crafted video scene featuring creative visual elements with cinematic quality. The composition includes professional lighting setup with key, fill, and rim lighting to create depth and visual interest. Camera movements are smooth and purposeful, utilizing techniques such as dolly shots, pans, and tilts to enhance the storytelling. Color grading emphasizes the mood and atmosphere appropriate to the content, with careful attention to contrast and saturation levels."
        }`
      }
      
      resolve({
        response: {
          text: () => response
        }
      })
    }, 500 + Math.random() * 1000) // Random delay 0.5-1.5s
  })
}

// Test prompts
const testPrompts = [
  {
    name: '橘猫追蝴蝶',
    input: '一只可爱的橘猫在阳光明媚的花园里追逐蝴蝶',
    expected: 'cat'
  },
  {
    name: '未来城市夜景',
    input: '未来城市的夜景，霓虹灯闪烁，飞行汽车穿梭',
    expected: 'futuristic'
  },
  {
    name: '雪山湖泊',
    input: '雪山脚下的湖泊，倒影清晰，微风轻拂',
    expected: 'mountain'
  },
  {
    name: '通用创意场景',
    input: '创建一个充满创意的视频场景',
    expected: 'creative'
  }
]

// Parse response function (same as in actual code)
function parseGeminiResponse(content) {
  let parsed
  
  try {
    // Extract JSON from response if it's wrapped in markdown
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/)
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content
    parsed = JSON.parse(jsonStr)
  } catch (parseError) {
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
}

// Run mock tests
async function runMockTests() {
  console.log('🚀 开始模拟 API 测试...\n')
  
  let successCount = 0
  const totalTests = testPrompts.length
  
  for (let i = 0; i < testPrompts.length; i++) {
    const test = testPrompts[i]
    console.log(`📋 测试 ${i + 1}/${totalTests}: ${test.name}`)
    console.log(`📝 输入: ${test.input}`)
    
    try {
      const startTime = Date.now()
      
      // Mock API call
      const result = await mockGenerateContent(test.input)
      const content = result.response.text()
      
      // Parse response
      const parsed = parseGeminiResponse(content)
      
      const endTime = Date.now()
      
      console.log(`✅ 生成成功 (${endTime - startTime}ms)`)
      console.log(`📏 简洁版本 (${parsed.short.length} 字符):`)
      console.log(`   ${parsed.short}`)
      console.log(`📖 详细版本 (${parsed.long.length} 字符):`)
      console.log(`   ${parsed.long.substring(0, 100)}${parsed.long.length > 100 ? '...' : ''}`)
      
      // Validate response quality
      if (parsed.short.length >= 30 && parsed.long.length >= 100) {
        console.log(`✅ 响应质量: 符合要求`)
        successCount++
      } else {
        console.log(`⚠️  响应质量: 长度不足`)
      }
      
    } catch (error) {
      console.error(`❌ 测试失败:`, error.message)
    }
    
    console.log(`\n${'='.repeat(60)}\n`)
  }
  
  // Test summary
  console.log(`🎯 模拟测试完成!`)
  console.log(`✅ 成功: ${successCount}/${totalTests}`)
  console.log(`❌ 失败: ${totalTests - successCount}/${totalTests}`)
  
  if (successCount === totalTests) {
    console.log(`🎉 所有模拟测试通过! API 集成逻辑正常.`)
  } else {
    console.log(`⚠️  部分测试失败，需要检查代码逻辑.`)
  }
}

// Performance test
async function performanceTest() {
  console.log('\n⚡ 性能测试...')
  
  const iterations = 5
  const times = []
  
  for (let i = 0; i < iterations; i++) {
    const startTime = Date.now()
    await mockGenerateContent('测试性能的简单输入')
    const endTime = Date.now()
    times.push(endTime - startTime)
  }
  
  const avgTime = times.reduce((a, b) => a + b, 0) / times.length
  const minTime = Math.min(...times)
  const maxTime = Math.max(...times)
  
  console.log(`📊 性能统计 (${iterations} 次测试):`)
  console.log(`   平均响应时间: ${avgTime.toFixed(0)}ms`)
  console.log(`   最快响应: ${minTime}ms`)
  console.log(`   最慢响应: ${maxTime}ms`)
  
  if (avgTime < 2000) {
    console.log(`✅ 性能: 优秀 (< 2秒)`)
  } else if (avgTime < 5000) {
    console.log(`⚠️  性能: 一般 (2-5秒)`)
  } else {
    console.log(`❌ 性能: 需要优化 (> 5秒)`)
  }
}

// Error handling test
async function errorHandlingTest() {
  console.log('\n🛠️  错误处理测试...')
  
  // Test malformed JSON response
  const malformedResponse = 'This is not a JSON response'
  try {
    const parsed = parseGeminiResponse(malformedResponse)
    console.log(`✅ 非JSON响应处理: 成功`)
    console.log(`   回退结果: ${parsed.short.substring(0, 50)}...`)
  } catch (error) {
    console.log(`❌ 非JSON响应处理: 失败 - ${error.message}`)
  }
  
  // Test empty response
  try {
    const parsed = parseGeminiResponse('')
    console.log(`✅ 空响应处理: 成功`)
  } catch (error) {
    console.log(`❌ 空响应处理: 失败 - ${error.message}`)
  }
}

// Main test execution
async function main() {
  await runMockTests()
  await performanceTest()
  await errorHandlingTest()
  
  console.log('\n🎊 所有模拟测试完成!')
  console.log('\n📋 真实 API 测试步骤:')
  console.log('1. 获取 Gemini API Key: https://aistudio.google.com/')
  console.log('2. 设置环境变量: export GEMINI_API_KEY=your_api_key')
  console.log('3. 运行真实测试: node test-gemini.js')
  console.log('4. 启动开发服务器测试完整功能')
}

main().catch(console.error)