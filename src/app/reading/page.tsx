'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function ReadingPage() {
    const { user, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!user) return null

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => window.location.href = '/dashboard'}
                                className="text-indigo-600 hover:text-indigo-800"
                            >
                                ← Quay lại Dashboard
                            </button>
                            <h1 className="text-2xl font-bold text-gray-900">Luyện Đọc TOEIC</h1>
                        </div>
                        <div className="text-sm text-gray-600">
                            Xin chào, {user.displayName || user.email}
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Overview */}
                    <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                        <div className="px-4 py-5 sm:p-6">
                            <h2 className="text-xl font-semibold text-gray-900 mb-4">
                                Luyện Reading - 3 Parts
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Luyện tập kỹ năng đọc hiểu với 3 phần thi chính thức của TOEIC.
                                Từ ngữ pháp cơ bản đến đọc hiểu văn bản phức tạp.
                            </p>
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                <div className="flex">
                                    <div className="flex-shrink-0">
                                        <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div className="ml-3">
                                        <h3 className="text-sm font-medium text-yellow-800">
                                            Thời gian: 75 phút cho 100 câu hỏi
                                        </h3>
                                        <div className="mt-2 text-sm text-yellow-700">
                                            <p>Quản lý thời gian hiệu quả là chìa khóa thành công ở phần Reading!</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Parts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {/* Part 5 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-green-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                                        5
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Part 5: Incomplete Sentences</h3>
                                        <p className="text-sm text-gray-500">30 câu hỏi • Ngữ pháp & từ vựng</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Hoàn thành câu bằng cách chọn từ/cụm từ phù hợp nhất trong 4 lựa chọn.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Độ khó:</span>
                                        <div className="flex space-x-1">
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Thời gian khuyến nghị:</span>
                                        <span className="font-medium">20 phút</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Kỹ năng:</span>
                                        <span className="font-medium">Ngữ pháp</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href="/reading/part5"
                                        className="w-full bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition duration-300 inline-block text-center"
                                    >
                                        Bắt đầu Part 5
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Part 6 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-blue-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                                        6
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Part 6: Text Completion</h3>
                                        <p className="text-sm text-gray-500">16 câu hỏi • Hoàn thành đoạn văn</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Đọc đoạn văn và chọn từ/câu phù hợp để điền vào chỗ trống.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Độ khó:</span>
                                        <div className="flex space-x-1">
                                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-blue-400 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Thời gian khuyến nghị:</span>
                                        <span className="font-medium">10 phút</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Kỹ năng:</span>
                                        <span className="font-medium">Ngữ cảnh</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href="/reading/part6"
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 inline-block text-center"
                                    >
                                        Bắt đầu Part 6
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Part 7 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center mb-4">
                                    <div className="bg-purple-500 rounded-full w-12 h-12 flex items-center justify-center text-white font-bold text-lg">
                                        7
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-semibold text-gray-900">Part 7: Reading Comprehension</h3>
                                        <p className="text-sm text-gray-500">54 câu hỏi • Đọc hiểu</p>
                                    </div>
                                </div>
                                <p className="text-gray-600 mb-4">
                                    Đọc các đoạn văn và trả lời câu hỏi về nội dung, ý nghĩa và chi tiết.
                                </p>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Độ khó:</span>
                                        <div className="flex space-x-1">
                                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                            <div className="w-3 h-3 bg-purple-400 rounded-full"></div>
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Thời gian khuyến nghị:</span>
                                        <span className="font-medium">45 phút</span>
                                    </div>
                                    <div className="flex justify-between items-center text-sm">
                                        <span className="text-gray-500">Kỹ năng:</span>
                                        <span className="font-medium">Đọc hiểu</span>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <Link
                                        href="/reading/part7"
                                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition duration-300 inline-block text-center"
                                    >
                                        Bắt đầu Part 7
                                    </Link>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Reading Strategy */}
                    <div className="mt-8 grid md:grid-cols-2 gap-6">
                        {/* Tips */}
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-indigo-900 mb-4">
                                💡 Chiến lược làm bài Reading
                            </h3>
                            <div className="space-y-3 text-sm text-indigo-800">
                                <div className="flex items-start">
                                    <span className="font-medium mr-2">1.</span>
                                    <span>Bắt đầu với Part 5 (dễ nhất, tốn ít thời gian)</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium mr-2">2.</span>
                                    <span>Đọc câu hỏi trước khi đọc đoạn văn (Part 7)</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium mr-2">3.</span>
                                    <span>Tìm từ khóa để định vị thông tin nhanh chóng</span>
                                </div>
                                <div className="flex items-start">
                                    <span className="font-medium mr-2">4.</span>
                                    <span>Đừng mắc kẹt ở 1 câu quá lâu, hãy đoán và tiếp tục</span>
                                </div>
                            </div>
                        </div>

                        {/* Time Management */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-yellow-900 mb-4">
                                ⏰ Phân bổ thời gian
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-800">Part 5 (30 câu)</span>
                                    <span className="font-medium text-yellow-900">20 phút</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-800">Part 6 (16 câu)</span>
                                    <span className="font-medium text-yellow-900">10 phút</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-yellow-800">Part 7 (54 câu)</span>
                                    <span className="font-medium text-yellow-900">45 phút</span>
                                </div>
                                <hr className="border-yellow-300" />
                                <div className="flex justify-between items-center font-semibold">
                                    <span className="text-yellow-900">Tổng cộng</span>
                                    <span className="text-yellow-900">75 phút</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Practice */}
                    <div className="mt-8 bg-white shadow rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Luyện tập nhanh
                        </h3>
                        <div className="grid md:grid-cols-3 gap-4">
                            <Link
                                href="/reading/mixed-practice"
                                className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg text-center hover:from-green-600 hover:to-blue-600 transition"
                            >
                                <div className="font-semibold">Mixed Practice</div>
                                <div className="text-sm opacity-90">15 câu hỗn hợp</div>
                            </Link>
                            <Link
                                href="/reading/grammar-focus"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg text-center hover:from-purple-600 hover:to-pink-600 transition"
                            >
                                <div className="font-semibold">Grammar Focus</div>
                                <div className="text-sm opacity-90">Chuyên về ngữ pháp</div>
                            </Link>
                            <Link
                                href="/reading/speed-reading"
                                className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-lg text-center hover:from-orange-600 hover:to-red-600 transition"
                            >
                                <div className="font-semibold">Speed Reading</div>
                                <div className="text-sm opacity-90">Luyện tốc độ đọc</div>
                            </Link>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
