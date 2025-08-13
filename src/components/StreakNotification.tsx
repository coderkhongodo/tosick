'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/components/AuthContext'

export default function StreakNotification() {
    const { appUser } = useAuth()
    const [showNotification, setShowNotification] = useState(false)
    const [timeUntilReset, setTimeUntilReset] = useState('')

    useEffect(() => {
        if (!appUser?.studyStats?.lastStudyDate) return

        const lastStudyDate = new Date(appUser.studyStats.lastStudyDate)
        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const lastStudyDateOnly = new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate())

        const daysDiff = Math.floor((today.getTime() - lastStudyDateOnly.getTime()) / (1000 * 60 * 60 * 24))

        // Show warning if haven't studied today and have an active streak
        if (daysDiff === 0 && appUser.studyStats.streak > 0) {
            // Studied today, calculate time until streak reset
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            tomorrow.setHours(0, 0, 0, 0)

            const interval = setInterval(() => {
                const timeLeft = tomorrow.getTime() - Date.now()

                if (timeLeft > 0) {
                    const hours = Math.floor(timeLeft / (1000 * 60 * 60))
                    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60))
                    setTimeUntilReset(`${hours}h ${minutes}m`)
                } else {
                    clearInterval(interval)
                    setTimeUntilReset('Streak may reset soon!')
                }
            }, 60000) // Update every minute

            return () => clearInterval(interval)
        } else if (daysDiff >= 1 && appUser.studyStats.streak > 0) {
            // Haven't studied today, show warning
            setShowNotification(true)
        }
    }, [appUser])

    if (!appUser || !showNotification) return null

    const lastStudyDate = new Date(appUser.studyStats.lastStudyDate!)
    const daysSinceLastStudy = Math.floor((Date.now() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))

    return (
        <div className="fixed top-4 right-4 max-w-sm w-full bg-red-50 border border-red-200 rounded-lg shadow-lg z-50">
            <div className="p-4">
                <div className="flex">
                    <div className="flex-shrink-0">
                        <span className="text-2xl">⚠️</span>
                    </div>
                    <div className="ml-3 flex-1">
                        <h3 className="text-sm font-medium text-red-800">
                            Streak sắp bị reset!
                        </h3>
                        <div className="mt-2 text-sm text-red-700">
                            <p>
                                Bạn chưa học hôm nay. Streak hiện tại: <strong>{appUser.studyStats.streak} ngày</strong>
                            </p>
                            {daysSinceLastStudy > 1 && (
                                <p className="mt-1 text-red-800 font-medium">
                                    Đã {daysSinceLastStudy} ngày không học. Streak sẽ bị reset!
                                </p>
                            )}
                        </div>
                        <div className="mt-3">
                            <div className="flex">
                                <button
                                    onClick={() => {
                                        window.location.href = '/reading'
                                    }}
                                    className="bg-red-600 text-white px-3 py-1 text-xs rounded-md hover:bg-red-700 mr-2"
                                >
                                    Học ngay
                                </button>
                                <button
                                    onClick={() => setShowNotification(false)}
                                    className="text-red-600 px-3 py-1 text-xs rounded-md hover:bg-red-100"
                                >
                                    Đóng
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

// Component to show streak maintenance tips
export function StreakTips() {
    const { appUser } = useAuth()

    if (!appUser) return null

    const streak = appUser.studyStats?.streak || 0
    const lastStudyDate = appUser.studyStats?.lastStudyDate

    // Check if studied today
    const studiedToday = lastStudyDate ?
        new Date(lastStudyDate).toDateString() === new Date().toDateString() : false

    return (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
            <div className="flex">
                <div className="flex-shrink-0">
                    <span className="text-2xl">💡</span>
                </div>
                <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">
                        Tips duy trì streak
                    </h3>
                    <div className="mt-2 text-sm text-blue-700">
                        {streak === 0 ? (
                            <p>Bắt đầu streak bằng cách học ít nhất 1 phút mỗi ngày!</p>
                        ) : studiedToday ? (
                            <p>🎉 Tuyệt vời! Bạn đã học hôm nay. Streak hiện tại: <strong>{streak} ngày</strong></p>
                        ) : (
                            <p>⏰ Hãy học ít nhất 1 phút để duy trì streak {streak} ngày!</p>
                        )}

                        <ul className="mt-2 space-y-1 text-xs">
                            <li>• Học ít nhất 1 phút mỗi ngày để duy trì streak</li>
                            <li>• Streak sẽ reset nếu bạn không học trong ngày</li>
                            <li>• Thời gian được tính khi bạn active trên trang web</li>
                            <li>• Làm bài test cũng được tính vào thời gian học</li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
