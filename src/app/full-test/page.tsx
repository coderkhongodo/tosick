'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

export default function FullTestPage() {
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
                            <h1 className="text-2xl font-bold text-gray-900">Đề thi thử TOEIC</h1>
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
                                Mô phỏng đề thi TOEIC thật 100%
                            </h2>
                            <p className="text-gray-600 mb-4">
                                Trải nghiệm bài thi TOEIC hoàn chỉnh với 200 câu hỏi trong 120 phút.
                                Kết quả sẽ được chấm điểm theo thang điểm chính thức.
                            </p>

                            {/* Test Info */}
                            <div className="grid md:grid-cols-2 gap-6 mb-6">
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-blue-900 mb-2">📈 Cấu trúc đề thi</h3>
                                    <div className="space-y-2 text-sm text-blue-800">
                                        <div className="flex justify-between">
                                            <span>Listening (Part 1-4)</span>
                                            <span>100 câu • 45 phút</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Reading (Part 5-7)</span>
                                            <span>100 câu • 75 phút</span>
                                        </div>
                                        <hr className="border-blue-300" />
                                        <div className="flex justify-between font-semibold">
                                            <span>Tổng cộng</span>
                                            <span>200 câu • 120 phút</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h3 className="font-semibold text-yellow-900 mb-2">⚠️ Lưu ý quan trọng</h3>
                                    <ul className="space-y-1 text-sm text-yellow-800">
                                        <li>• Không được tạm dừng giữa chừng</li>
                                        <li>• Audio chỉ phát 1 lần</li>
                                        <li>• Làm theo thứ tự từ Part 1 → Part 7</li>
                                        <li>• Có thể xem lại và sửa đáp án</li>
                                        <li>• Nộp bài tự động khi hết giờ</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Available Tests */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {/* Test 1 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Đề thi số 1</h3>
                                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                                        Mới
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 text-sm">
                                    Đề thi mô phỏng với độ khó chuẩn quốc tế. Phù hợp để đánh giá năng lực hiện tại.
                                </p>
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Độ khó:</span>
                                        <span className="font-medium">Trung bình</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Lượt thi:</span>
                                        <span className="font-medium">1,234</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Điểm TB:</span>
                                        <span className="font-medium">650</span>
                                    </div>
                                </div>
                                <Link
                                    href="/full-test/test1"
                                    className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition duration-300 inline-block text-center"
                                >
                                    Bắt đầu thi
                                </Link>
                            </div>
                        </div>

                        {/* Test 2 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Đề thi số 2</h3>
                                    <span className="bg-orange-100 text-orange-800 px-2 py-1 rounded text-sm">
                                        Khó
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 text-sm">
                                    Đề thi nâng cao cho những ai muốn thử thách bản thân với mức độ khó hơn.
                                </p>
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Độ khó:</span>
                                        <span className="font-medium">Khó</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Lượt thi:</span>
                                        <span className="font-medium">856</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Điểm TB:</span>
                                        <span className="font-medium">580</span>
                                    </div>
                                </div>
                                <Link
                                    href="/full-test/test2"
                                    className="w-full bg-orange-600 text-white px-4 py-2 rounded-md hover:bg-orange-700 transition duration-300 inline-block text-center"
                                >
                                    Bắt đầu thi
                                </Link>
                            </div>
                        </div>

                        {/* Test 3 */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">Đề thi số 3</h3>
                                    <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">
                                        Dễ
                                    </span>
                                </div>
                                <p className="text-gray-600 mb-4 text-sm">
                                    Đề thi dành cho người mới bắt đầu, giúp làm quen với format bài thi.
                                </p>
                                <div className="space-y-2 mb-4 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Độ khó:</span>
                                        <span className="font-medium">Dễ</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Lượt thi:</span>
                                        <span className="font-medium">2,156</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-500">Điểm TB:</span>
                                        <span className="font-medium">720</span>
                                    </div>
                                </div>
                                <Link
                                    href="/full-test/test3"
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition duration-300 inline-block text-center"
                                >
                                    Bắt đầu thi
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Quick Practice */}
                    <div className="bg-white shadow rounded-lg p-6 mb-8">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Luyện tập nhanh
                        </h3>
                        <p className="text-gray-600 mb-4">
                            Chưa sẵn sàng cho bài thi đầy đủ? Hãy luyện tập từng phần trước.
                        </p>
                        <div className="grid md:grid-cols-4 gap-4">
                            <Link
                                href="/listening"
                                className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg text-center hover:from-blue-600 hover:to-purple-600 transition"
                            >
                                <div className="font-semibold">Listening</div>
                                <div className="text-sm opacity-90">Parts 1-4</div>
                            </Link>
                            <Link
                                href="/reading"
                                className="bg-gradient-to-r from-green-500 to-blue-500 text-white p-4 rounded-lg text-center hover:from-green-600 hover:to-blue-600 transition"
                            >
                                <div className="font-semibold">Reading</div>
                                <div className="text-sm opacity-90">Parts 5-7</div>
                            </Link>
                            <Link
                                href="/vocabulary"
                                className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white p-4 rounded-lg text-center hover:from-yellow-600 hover:to-orange-600 transition"
                            >
                                <div className="font-semibold">Vocabulary</div>
                                <div className="text-sm opacity-90">1000+ từ</div>
                            </Link>
                            <Link
                                href="/grammar"
                                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg text-center hover:from-purple-600 hover:to-pink-600 transition"
                            >
                                <div className="font-semibold">Grammar</div>
                                <div className="text-sm opacity-90">Ngữ pháp</div>
                            </Link>
                        </div>
                    </div>

                    {/* Test History */}
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-xl font-semibold text-gray-900 mb-4">
                            Lịch sử thi gần đây
                        </h3>
                        <div className="text-center py-8 text-gray-500">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                            </svg>
                            <p className="mt-2">Chưa có lịch sử thi</p>
                            <p className="text-sm text-gray-400">Hoàn thành bài thi đầu tiên để xem kết quả tại đây</p>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
