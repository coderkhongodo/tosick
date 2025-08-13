'use client'

import { useEffect, useState } from 'react'
import { sessionTracker } from '@/lib/sessionTracker'
import { useAuth } from '@/components/AuthContext'

interface StudyTimeDisplayProps {
    totalStudyTime?: number // optional override from parent
    streak?: number
}

export default function StudyTimeDisplay({ totalStudyTime, streak }: StudyTimeDisplayProps) {
    const { user, appUser } = useAuth()
    const [currentSessionTime, setCurrentSessionTime] = useState(0)
    const [isActive, setIsActive] = useState(false)
    const [dbTotalStudyTime, setDbTotalStudyTime] = useState<number>(appUser?.studyStats?.totalStudyTime || totalStudyTime || 0)
    const [dbStreak, setDbStreak] = useState<number>(appUser?.studyStats?.streak || streak || 0)

    useEffect(() => {
        // Update current session time every minute
        const interval = setInterval(() => {
            const sessionTime = sessionTracker.getCurrentSessionTime()
            setCurrentSessionTime(sessionTime)
            setIsActive(sessionTime > 0)
        }, 1000) // Update every second for smooth display

        return () => clearInterval(interval)
    }, [])

    const formatTime = (minutes: number) => {
        const hours = Math.floor(minutes / 60)
        const mins = minutes % 60

        if (hours > 0) {
            return `${hours}h ${mins}m`
        }
        return `${mins}m`
    }

    // Periodically pull latest stats from DB so dashboard reflects real-time
    useEffect(() => {
        let intervalId: NodeJS.Timeout | null = null

        const fetchLatestStats = async () => {
            try {
                if (!user?.uid) return
                const res = await fetch(`/api/user?uid=${user.uid}`)
                if (!res.ok) return
                const data = await res.json()
                const stats = data?.user?.studyStats
                if (stats) {
                    setDbTotalStudyTime(stats.totalStudyTime || 0)
                    setDbStreak(stats.streak || 0)
                }
            } catch (e) {
                // noop
            }
        }

        // Initial fetch and then poll every 30s
        fetchLatestStats()
        intervalId = setInterval(fetchLatestStats, 30000)

        // Also refresh when window gains focus
        const onFocus = () => fetchLatestStats()
        if (typeof window !== 'undefined') {
            window.addEventListener('focus', onFocus)
        }

        return () => {
            if (intervalId) clearInterval(intervalId)
            if (typeof window !== 'undefined') {
                window.removeEventListener('focus', onFocus)
            }
        }
    }, [user?.uid])

    const totalTimeWithSession = dbTotalStudyTime + currentSessionTime

    return (
        <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
                <div className="flex items-center">
                    <div className="flex-shrink-0">
                        <div className={`rounded-md p-3 ${isActive ? 'bg-green-500 animate-pulse' : 'bg-blue-500'}`}>
                            <svg className="h-8 w-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                        </div>
                    </div>
                    <div className="ml-5 w-0 flex-1">
                        <dl>
                            <dt className="text-sm font-medium text-gray-500 truncate">
                                Thời gian học
                            </dt>
                            <dd className="flex items-baseline">
                                <div className="text-2xl font-semibold text-gray-900">
                                    {formatTime(totalTimeWithSession)}
                                </div>
                                {currentSessionTime > 0 && (
                                    <div className="ml-2 flex items-baseline text-sm">
                                        <span className="text-green-600 font-medium">
                                            +{formatTime(currentSessionTime)}
                                        </span>
                                        <span className="ml-1 text-gray-500">phiên này</span>
                                    </div>
                                )}
                            </dd>
                        </dl>
                    </div>
                </div>

                {/* Streak Display */}
                <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <span className="text-2xl">🔥</span>
                            <div className="ml-2">
                                <div className="text-sm text-gray-500">Streak</div>
                                <div className="text-lg font-semibold text-orange-600">
                                    {dbStreak} ngày
                                </div>
                            </div>
                        </div>

                        {isActive && (
                            <div className="flex items-center text-green-600">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-2"></div>
                                <span className="text-sm font-medium">Đang học</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Study tips */}
                {streak === 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-yellow-400">💡</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-yellow-800">
                                    Học mỗi ngày để xây dựng streak! Streak sẽ reset nếu bạn không học trong ngày.
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {streak >= 7 && (
                    <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-md">
                        <div className="flex">
                            <div className="flex-shrink-0">
                                <span className="text-green-400">🎉</span>
                            </div>
                            <div className="ml-3">
                                <p className="text-sm text-green-800">
                                    Tuyệt vời! Bạn đã học liên tục {streak} ngày. Hãy tiếp tục duy trì!
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
