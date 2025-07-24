import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { input, type, style, quality, aspectRatio } = await request.json();

    if (!input || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: input, type' },
        { status: 400 }
      );
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    const prompt = `Generate a detailed and creative Veo3 video prompt based on the following requirements:

Input: ${input}
Type: ${type}
Style: ${style || 'cinematic'}
Quality: ${quality || 'high'}
Aspect Ratio: ${aspectRatio || '16:9'}

Please provide:
1. A complete video prompt (50-200 words)
2. Key visual elements to include
3. Camera movement suggestions
4. Lighting recommendations
5. Color palette suggestions

Format the response as a JSON object with these properties:
{
  "prompt": "the complete video prompt",
  "visualElements": ["element1", "element2", ...],
  "cameraMovements": ["movement1", "movement2", ...],
  "lighting": "lighting description",
  "colorPalette": ["color1", "color2", ...]
}`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the response to extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return NextResponse.json(parsed);
    }
    
    // Fallback response
    return NextResponse.json({
      prompt: text,
      visualElements: [],
      cameraMovements: [],
      lighting: 'Natural lighting',
      colorPalette: ['warm', 'vibrant']
    });

  } catch (error) {
    console.error('Error generating prompt:', error);
    return NextResponse.json(
      { error: 'Failed to generate prompt' },
      { status: 500 }
    );
  }
}

export const maxDuration = 30; // Vercel max duration