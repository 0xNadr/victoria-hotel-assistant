import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import MobileLayout from '@/components/MobileLayout'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Viktoria Control Center | Dormero Hotels',
  description: 'Voice AI Control Center for Dormero Hotels',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <MobileLayout>{children}</MobileLayout>
      </body>
    </html>
  )
}
