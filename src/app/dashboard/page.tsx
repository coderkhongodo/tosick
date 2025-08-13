'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { signOut } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import Link from 'next/link'
import { useAuth } from '@/components/AuthContext'
import StudyTimeDisplay from '@/components/StudyTimeDisplay'
import StreakNotification, { StreakTips } from '@/components/StreakNotification'

export default function DashboardPage() {
    const { user, appUser, loading } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    const handleLogout = async () => {
        try {
            await signOut(auth)
            router.push('/')
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!user) {
        return null
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Streak Warning Notification */}
            <StreakNotification />

            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center">
                            <Link href="/" className="text-2xl font-bold text-indigo-600">
                                TOEIC Practice
                            </Link>
                        </div>
                        <div className="flex items-center space-x-4">
                            <span className="text-gray-700">Xin chào, {user.displayName || user.email}</span>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700"
                            >
                                Đăng xuất
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                {/* Welcome Section */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="bg-white overflow-hidden shadow rounded-lg">
                        <div className="px-4 py-5 sm:p-6">
                            <h1 className="text-3xl font-bold text-gray-900 mb-4">
                                Chào mừng bạn đến với TOEIC Practice!
                            </h1>
                            <p className="text-gray-600 mb-6">
                                Bắt đầu hành trình luyện thi TOEIC của bạn với các tính năng dưới đây:
                            </p>
                        </div>
                    </div>
                </div>

                {/* Quick Stats */}
                <div className="px-4 py-6 sm:px-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Study Time Display with Real-time Tracking */}
                        <StudyTimeDisplay
                            totalStudyTime={appUser?.studyStats?.totalStudyTime || 0}
                            streak={appUser?.studyStats?.streak || 0}
                        />

                        {/* Removed Completed Tests card as requested */}
                    </div>
                </div>



                {/* Practice Options */}
                <div className="px-4 py-6 sm:px-0">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Lựa chọn luyện tập</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Reading Practice */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-blue-500 rounded-md p-3">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Luyện đọc</h3>
                                        <p className="text-sm text-gray-500">Part 5-7, 100 câu hỏi</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/reading"
                                        className="w-full bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 inline-block text-center"
                                    >
                                        Bắt đầu luyện
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Completed Tests */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-green-500 rounded-md p-3">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Bài đã hoàn thành</h3>
                                        <p className="text-sm text-gray-500">{appUser?.studyStats?.completedTests || 0} bài test</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <div className="w-full bg-green-100 text-green-800 px-4 py-2 rounded-md text-center font-medium">
                                        {appUser?.studyStats?.completedTests || 0} bài
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Full Test */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-purple-500 rounded-md p-3">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Đề thi thử</h3>
                                        <p className="text-sm text-gray-500">Mô phỏng 100% đề thật</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/full-test"
                                        className="w-full bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 inline-block text-center"
                                    >
                                        Làm đề thi thử
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Vocabulary */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-yellow-500 rounded-md p-3">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Từ vựng</h3>
                                        <p className="text-sm text-gray-500">1000+ từ vựng TOEIC</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/vocabulary"
                                        className="w-full bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 inline-block text-center"
                                    >
                                        Học từ vựng
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Grammar */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-red-500 rounded-md p-3">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Ngữ pháp</h3>
                                        <p className="text-sm text-gray-500">Các chủ đề ngữ pháp cơ bản</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/grammar"
                                        className="w-full bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 inline-block text-center"
                                    >
                                        Học ngữ pháp
                                    </Link>
                                </div>
                            </div>
                        </div>

                        {/* Progress */}
                        <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-center">
                                    <div className="flex-shrink-0">
                                        <div className="bg-indigo-500 rounded-md p-3">
                                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="ml-4">
                                        <h3 className="text-lg font-medium text-gray-900">Tiến độ</h3>
                                        <p className="text-sm text-gray-500">Xem báo cáo chi tiết</p>
                                    </div>
                                </div>
                                <div className="mt-4">
                                    <Link
                                        href="/progress"
                                        className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 inline-block text-center"
                                    >
                                        Xem tiến độ
                                    </Link>
                                </div>
                            </div>
                        </div>


                    </div>

                    {/* Streak Tips */}
                    <StreakTips />
                </div>
            </main>
        </div>
    )
}
