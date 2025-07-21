import { NextResponse } from 'next/server'

export async function GET() {
  try {
    // Basic health check
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'veo3-prompt-generator-frontend',
      version: '1.0.0',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      environment: process.env.NODE_ENV || 'development'
    }

    return NextResponse.json(healthData, { status: 200 })
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'ERROR', 
        timestamp: new Date().toISOString(),
        error: 'Health check failed' 
      }, 
      { status: 500 }
    )
  }
}