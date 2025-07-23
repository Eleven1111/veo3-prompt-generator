import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Dynamic import for sharp to handle Vercel deployment issues
let sharp: any = null
try {
  sharp = require('sharp')
} catch (error) {
  console.warn('Sharp not available, image processing will be limited')
}

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '')
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' })

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Security helper functions
const detectMaliciousContent = (text: string): boolean => {
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

const sanitizeImageMetadata = async (buffer: Buffer): Promise<Buffer> => {
  if (!sharp) {
    // Fallback: return original buffer if sharp is not available
    console.warn('Sharp not available, returning original image buffer')
    return buffer
  }
  
  try {
    return await sharp(buffer)
      .jpeg({ quality: 80 })
      .resize(1024, 1024, { fit: 'inside', withoutEnlargement: true })
      .toBuffer()
  } catch (error) {
    console.error('Sharp processing failed, returning original buffer:', error)
    return buffer
  }
}

// Rate limiting
const checkRateLimit = (ip: string): boolean => {
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

// AI Prompt Generation with Gemini
const generateVeo3Prompt = async (inputText: string, imageBuffer?: Buffer): Promise<{ short: string, long: string }> => {
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

${imageBuffer ? 'The user has provided a reference image along with text description. Analyze the image and incorporate its visual elements into the prompts.' : 'Generate based on text description only.'}

Respond in JSON format with "short" and "long" keys.

User input: ${inputText}`

  try {
    let result

    if (imageBuffer) {
      // Convert image buffer to base64 for Gemini
      const base64Image = imageBuffer.toString('base64')
      const imagePart = {
        inlineData: {
          data: base64Image,
          mimeType: 'image/jpeg'
        }
      }

      result = await model.generateContent([systemPrompt, imagePart])
    } else {
      result = await model.generateContent(systemPrompt)
    }

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
    // Get client IP for rate limiting
    const headersList = headers()
    const forwarded = headersList.get('x-forwarded-for')
    const ip = forwarded ? forwarded.split(',')[0] : 'unknown'

    // Rate limiting
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    // Parse form data
    const formData = await request.formData()
    const text = formData.get('text') as string
    const type = formData.get('type') as string
    const imageFile = formData.get('image') as File | null

    // Validate input type
    if (!['text', 'text-image', 'image'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid input type' },
        { status: 400 }
      )
    }

    // Validate required fields
    if (type === 'text' && !text) {
      return NextResponse.json(
        { error: 'Text is required for text input type' },
        { status: 400 }
      )
    }

    if ((type === 'text-image' || type === 'image') && !imageFile) {
      return NextResponse.json(
        { error: 'Image is required for this input type' },
        { status: 400 }
      )
    }

    // Security checks
    if (text && detectMaliciousContent(text)) {
      console.warn(`Malicious content detected from IP: ${ip}`)
      return NextResponse.json(
        { error: 'Invalid input content' },
        { status: 400 }
      )
    }

    let inputForAI = text || 'Analyze the provided image and create a video prompt'
    let processedImageBuffer: Buffer | undefined

    // Process image if provided
    if (imageFile) {
      try {
        // Validate file type
        if (!imageFile.type.startsWith('image/')) {
          return NextResponse.json(
            { error: 'Invalid file type. Only images are allowed.' },
            { status: 400 }
          )
        }

        // Validate file size (5MB limit)
        if (imageFile.size > 5 * 1024 * 1024) {
          return NextResponse.json(
            { error: 'File too large. Maximum size is 5MB.' },
            { status: 400 }
          )
        }

        const buffer = Buffer.from(await imageFile.arrayBuffer())
        processedImageBuffer = await sanitizeImageMetadata(buffer)
      } catch (error) {
        console.error('Image processing error:', error)
        return NextResponse.json(
          { error: 'Image processing failed' },
          { status: 400 }
        )
      }
    }

    // Generate prompts using Gemini AI
    const prompts = await generateVeo3Prompt(inputForAI, processedImageBuffer)
    const promptId = crypto.randomUUID()

    // Log the generation (in production, save to database)
    console.log(`Prompt generated for IP: ${ip}, Type: ${type}, ID: ${promptId}`)

    return NextResponse.json({
      id: promptId,
      short: prompts.short,
      long: prompts.long
    })

  } catch (error) {
    console.error('Prompt generation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}