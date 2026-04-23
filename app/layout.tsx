import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Byte Demo',
  description: '基于 Next.js 和 DNDKit 的拖拽排序演示',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  )
}
