export interface TestProgress {
    id: string // unique ID cho progress này
    userId: string
    testType: 'reading' | 'listening'
    part: number
    testSet: number
    currentQuestion: number
    totalQuestions: number
    selectedAnswers: Record<string, number>
    timeSpent: number // seconds
    startTime: number // timestamp
    lastSaved: number // timestamp
    completed: boolean

    // Part-specific data
    currentPassage?: number // for Part 6, 7
    questions?: any[] // cached questions data
    passages?: any[] // for Part 6, 7
}

export interface ProgressStorage {
    saveProgress: (progress: TestProgress) => Promise<void>
    loadProgress: (userId: string, testType: string, part: number, testSet: number) => Promise<TestProgress | null>
    deleteProgress: (progressId: string) => Promise<void>
    getUserProgress: (userId: string) => Promise<TestProgress[]>
}
