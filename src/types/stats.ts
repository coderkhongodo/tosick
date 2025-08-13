export interface UserStats {
    userId: string
    totalTests: number
    totalQuestions: number
    correctAnswers: number
    totalTimeSpent: number // in minutes
    averageScore: number
    bestScore: number
    partStats: {
        [key: string]: {
            tests: number
            questions: number
            correct: number
            timeSpent: number
            averageScore: number
            bestScore: number
        }
    }
    recentTests: TestResult[]
    lastUpdated: Date
}

export interface TestResult {
    id: string
    testType: 'part5' | 'part6' | 'part7' | 'full-test'
    part: string
    testSet?: number
    score: number
    correctAnswers: number
    totalQuestions: number
    timeSpent: number // in minutes
    completedAt: Date
}

export interface StatsUpdate {
    testType: 'part5' | 'part6' | 'part7' | 'full-test'
    part: string
    testSet?: number
    score: number
    correctAnswers: number
    totalQuestions: number
    timeSpent: number
}
