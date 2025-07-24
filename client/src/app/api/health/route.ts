import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Basic health check for Vercel deployment
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'veo3-prompt-generator',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      gemini: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
    };

    return NextResponse.json(healthData, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      }, 
      { status: 500 }
    );
  }
}