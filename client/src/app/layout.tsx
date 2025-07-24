import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Veo3 Prompt Generator - AI视频创意转换平台',
  description: '智能将您的创意转换为Veo3友好的视频生成Prompt，支持文本、图片输入，提供长短两版本输出',
  keywords: 'Veo3, AI视频生成, Prompt生成器, 视频创意, AI工具',
  authors: [{ name: 'Veo3 Prompt Generator' }],
  openGraph: {
    title: 'Veo3 Prompt Generator - AI视频创意转换平台',
    description: '智能将您的创意转换为Veo3友好的视频生成Prompt',
    type: 'website',
    locale: 'zh_CN',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <head>
        <link rel="canonical" href="https://your-domain.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}