import { UserStats, TestResult, StatsUpdate } from '@/types/stats'

const STATS_KEY = 'toeic_user_stats'

export const statsStorage = {
    // Get user stats
    getUserStats: (userId: string): UserStats | null => {
        if (typeof window === 'undefined') return null

        try {
            const allStats = localStorage.getItem(STATS_KEY)
            if (!allStats) return null

            const parsedStats = JSON.parse(allStats)
            return parsedStats[userId] || null
        } catch (error) {
            console.error('Error getting user stats:', error)
            return null
        }
    },

    // Save/Update user stats
    updateUserStats: (userId: string, statsUpdate: StatsUpdate): void => {
        if (typeof window === 'undefined') return

        try {
            // Get existing stats
            const allStatsString = localStorage.getItem(STATS_KEY)
            const allStats = allStatsString ? JSON.parse(allStatsString) : {}

            // Get current user stats or create new
            const currentStats: UserStats = allStats[userId] || createInitialStats(userId)

            // Create test result
            const testResult: TestResult = {
                id: `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                testType: statsUpdate.testType,
                part: statsUpdate.part,
                testSet: statsUpdate.testSet,
                score: statsUpdate.score,
                correctAnswers: statsUpdate.correctAnswers,
                totalQuestions: statsUpdate.totalQuestions,
                timeSpent: statsUpdate.timeSpent,
                completedAt: new Date()
            }

            // Update overall stats
            currentStats.totalTests += 1
            currentStats.totalQuestions += statsUpdate.totalQuestions
            currentStats.correctAnswers += statsUpdate.correctAnswers
            currentStats.totalTimeSpent += statsUpdate.timeSpent
            currentStats.averageScore = Math.round((currentStats.correctAnswers / currentStats.totalQuestions) * 100)
            currentStats.bestScore = Math.max(currentStats.bestScore, statsUpdate.score)

            // Update part-specific stats
            const partKey = statsUpdate.part
            if (!currentStats.partStats[partKey]) {
                currentStats.partStats[partKey] = {
                    tests: 0,
                    questions: 0,
                    correct: 0,
                    timeSpent: 0,
                    averageScore: 0,
                    bestScore: 0
                }
            }

            const partStats = currentStats.partStats[partKey]
            partStats.tests += 1
            partStats.questions += statsUpdate.totalQuestions
            partStats.correct += statsUpdate.correctAnswers
            partStats.timeSpent += statsUpdate.timeSpent
            partStats.averageScore = Math.round((partStats.correct / partStats.questions) * 100)
            partStats.bestScore = Math.max(partStats.bestScore, statsUpdate.score)

            // Add to recent tests (keep only last 10)
            currentStats.recentTests.unshift(testResult)
            if (currentStats.recentTests.length > 10) {
                currentStats.recentTests = currentStats.recentTests.slice(0, 10)
            }

            // Update timestamp
            currentStats.lastUpdated = new Date()

            // Save back to storage
            allStats[userId] = currentStats
            localStorage.setItem(STATS_KEY, JSON.stringify(allStats))

        } catch (error) {
            console.error('Error updating user stats:', error)
        }
    },

    // Get all users stats (for admin)
    getAllStats: (): Record<string, UserStats> => {
        if (typeof window === 'undefined') return {}

        try {
            const allStats = localStorage.getItem(STATS_KEY)
            return allStats ? JSON.parse(allStats) : {}
        } catch (error) {
            console.error('Error getting all stats:', error)
            return {}
        }
    },

    // Clear user stats
    clearUserStats: (userId: string): void => {
        if (typeof window === 'undefined') return

        try {
            const allStatsString = localStorage.getItem(STATS_KEY)
            if (!allStatsString) return

            const allStats = JSON.parse(allStatsString)
            delete allStats[userId]
            localStorage.setItem(STATS_KEY, JSON.stringify(allStats))
        } catch (error) {
            console.error('Error clearing user stats:', error)
        }
    }
}

function createInitialStats(userId: string): UserStats {
    return {
        userId,
        totalTests: 0,
        totalQuestions: 0,
        correctAnswers: 0,
        totalTimeSpent: 0,
        averageScore: 0,
        bestScore: 0,
        partStats: {},
        recentTests: [],
        lastUpdated: new Date()
    }
}
