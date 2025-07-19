import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Guidy - 투어 예약 시스템',
  description: '투어 예약 및 가이드 매칭 서비스',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ko">
      <body>{children}</body>
    </html>
  )
} 