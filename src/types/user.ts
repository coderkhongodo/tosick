export interface User {
    _id?: string
    uid: string // Firebase UID
    email: string
    displayName: string
    photoURL?: string
    provider: 'google' | 'email' // Login provider
    role: 'user' | 'admin'
    studyStats: {
        totalStudyTime: number // minutes
        streak: number // days
        completedTests: number
        lastStudyDate?: Date
        streakStartDate?: Date
        sessions?: Array<{
            date: Date
            duration: number // minutes
            timestamp: string
        }>
    }
    loginHistory?: Array<{
        loginAt: Date
        provider: string
        ip?: string
    }>
    lastLoginAt?: Date
    createdAt: Date
    updatedAt: Date
}

export interface StudySession {
    userId: string
    studyTime: number // minutes
    date: Date
    testType?: string
    testPart?: string
}