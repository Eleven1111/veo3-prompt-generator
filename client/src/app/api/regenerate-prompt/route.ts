import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

// Simple in-memory cache for demo (in production, use Redis or database)
const promptCache = new Map<string, { inputText: string; hasImage: boolean; timestamp: number }>()

// AI Prompt Generation with Gemini
const generateVeo3Prompt = async (inputText: string, hasImage: boolean = false): Promise<{ short: string, long: string }> => {
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

${hasImage ? 'The user has provided a reference image along with text description.' : 'Generate based on text description only.'}

Create DIFFERENT variations from previous generations to provide fresh alternatives.

Respond in JSON format with "short" and "long" keys.

User input: ${inputText}`

  try {
    const result = await model.generateContent(systemPrompt)
    const response = await result.response
    const content = response.text()

    if (!content) {
      throw new Error('No response from Gemini')
    }

    // Try to parse JSON response
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
  } catch (error) {
    console.error('Gemini API error:', error)
    throw new Error('Failed to generate prompt')
  }
}

export async function POST(request: NextRequest) {
  try {
    const { promptId } = await request.json()
    
    if (!promptId) {
      return NextResponse.json(
        { error: 'Prompt ID is required' },
        { status: 400 }
      )
    }

    // Get cached prompt data (in production, get from database)
    const cachedData = promptCache.get(promptId)
    if (!cachedData) {
      // For demo purposes, generate a new prompt with default text
      const defaultText = "Create an engaging video scene with cinematic quality"
      const prompts = await generateVeo3Prompt(defaultText, false)
      
      return NextResponse.json({
        id: promptId,
        short: prompts.short,
        long: prompts.long
      })
    }

    // Check if cache is expired (1 hour)
    const now = Date.now()
    if (now - cachedData.timestamp > 3600000) {
      promptCache.delete(promptId)
      return NextResponse.json(
        { error: 'Prompt expired. Please generate a new one.' },
        { status: 404 }
      )
    }

    const { inputText, hasImage } = cachedData
    
    // Generate new prompts with variation
    const prompts = await generateVeo3Prompt(inputText, hasImage)
    
    console.log(`Prompt regenerated for ID: ${promptId}`)

    return NextResponse.json({
      id: promptId,
      short: prompts.short,
      long: prompts.long
    })

  } catch (error) {
    console.error('Prompt regeneration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}