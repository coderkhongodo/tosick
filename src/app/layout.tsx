import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/components/AuthContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
    title: 'TOEIC Practice - Luyện thi TOEIC hiệu quả',
    description: 'Nền tảng luyện thi TOEIC trực tuyến với đề thi thử, luyện nghe, luyện đọc và phân tích kết quả chi tiết.',
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <html lang="vi">
            <body className={inter.className}>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    )
}
