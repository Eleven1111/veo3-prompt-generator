import { NextRequest, NextResponse } from 'next/server';

// Mock data for demo (in production, connect to your database)
const generateMockDashboardData = () => {
  const now = new Date();
  const dates = [];
  
  // Generate last 7 days data
  for (let i = 6; i >= 0; i--) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    dates.push(date.toISOString().split('T')[0]);
  }

  return {
    totalUsers: Math.floor(Math.random() * 1000) + 500,
    totalPrompts: Math.floor(Math.random() * 5000) + 2000,
    todayPrompts: Math.floor(Math.random() * 100) + 20,
    successRate: Math.floor(Math.random() * 10) + 90,
    avgResponseTime: Math.random() * 2 + 0.5,
    topInputTypes: [
      { name: '纯文本', value: Math.floor(Math.random() * 100) + 50 },
      { name: '文本+图片', value: Math.floor(Math.random() * 80) + 30 },
      { name: '纯图片', value: Math.floor(Math.random() * 50) + 20 }
    ],
    dailyUsage: dates.map(date => ({
      date,
      prompts: Math.floor(Math.random() * 200) + 50,
      users: Math.floor(Math.random() * 100) + 20
    })),
    recentActivity: Array.from({ length: 20 }, (_, i) => ({
      id: crypto.randomUUID(),
      type: ['text', 'text-image', 'image'][Math.floor(Math.random() * 3)],
      timestamp: new Date(Date.now() - i * 300000).toISOString(),
      status: Math.random() > 0.1 ? 'success' : 'error',
      userAgent: 'Mozilla/5.0 (compatible; Demo/1.0)'
    }))
  };
};

export async function GET(request: NextRequest) {
  try {
    // For demo purposes, allow access without auth
    // In production, verify admin authentication here
    
    // Generate mock data (in production, query your database)
    const dashboardData = generateMockDashboardData();

    return NextResponse.json(dashboardData);

  } catch (error) {
    console.error('Dashboard data error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const maxDuration = 30;