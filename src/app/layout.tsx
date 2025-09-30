import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { MainLayout } from '@/components/layout/main-layout'
import { Toaster } from 'sonner'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Hantico Call Center - Система обзвона',
  description: 'Прототип системы автоматического обзвона с AI-агентами',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body className={inter.className}>
        <MainLayout>
          {children}
        </MainLayout>
        <Toaster position="bottom-right" />
      </body>
    </html>
  )
}
