import { TestProgress } from '@/types/progress'

class LocalProgressStorage {
    private getStorageKey(userId: string): string {
        return `toeic_progress_${userId}`
    }

    async saveProgress(progress: TestProgress): Promise<void> {
        try {
            const storageKey = this.getStorageKey(progress.userId)
            let allProgress: TestProgress[] = []

            // Load existing progress
            const existing = localStorage.getItem(storageKey)
            if (existing) {
                allProgress = JSON.parse(existing)
            }

            // Remove any existing progress for the same test
            allProgress = allProgress.filter(p =>
                !(p.testType === progress.testType &&
                    p.part === progress.part &&
                    p.testSet === progress.testSet)
            )

            // Add new progress
            progress.lastSaved = Date.now()
            allProgress.push(progress)

            // Keep only last 10 progress items
            allProgress = allProgress
                .sort((a, b) => b.lastSaved - a.lastSaved)
                .slice(0, 10)

            localStorage.setItem(storageKey, JSON.stringify(allProgress))
            console.log('Progress saved:', progress)
        } catch (error) {
            console.error('Failed to save progress:', error)
        }
    }

    async loadProgress(userId: string, testType: string, part: number, testSet: number): Promise<TestProgress | null> {
        try {
            const storageKey = this.getStorageKey(userId)
            const existing = localStorage.getItem(storageKey)

            if (!existing) return null

            const allProgress: TestProgress[] = JSON.parse(existing)
            const progress = allProgress.find(p =>
                p.testType === testType &&
                p.part === part &&
                p.testSet === testSet &&
                !p.completed
            )

            console.log('Progress loaded:', progress)
            return progress || null
        } catch (error) {
            console.error('Failed to load progress:', error)
            return null
        }
    }

    async deleteProgress(progressId: string, userId: string): Promise<void> {
        try {
            const storageKey = this.getStorageKey(userId)
            const existing = localStorage.getItem(storageKey)

            if (!existing) return

            let allProgress: TestProgress[] = JSON.parse(existing)
            allProgress = allProgress.filter(p => p.id !== progressId)

            localStorage.setItem(storageKey, JSON.stringify(allProgress))
            console.log('Progress deleted:', progressId)
        } catch (error) {
            console.error('Failed to delete progress:', error)
        }
    }

    async getUserProgress(userId: string): Promise<TestProgress[]> {
        try {
            const storageKey = this.getStorageKey(userId)
            const existing = localStorage.getItem(storageKey)

            if (!existing) return []

            const allProgress: TestProgress[] = JSON.parse(existing)
            return allProgress
                .filter(p => !p.completed)
                .sort((a, b) => b.lastSaved - a.lastSaved)
        } catch (error) {
            console.error('Failed to get user progress:', error)
            return []
        }
    }
}

export const progressStorage = new LocalProgressStorage()

// Helper functions
export function generateProgressId(userId: string, testType: string, part: number, testSet: number): string {
    return `${userId}_${testType}_part${part}_test${testSet}_${Date.now()}`
}

export function createProgress(
    userId: string,
    testType: 'reading' | 'listening',
    part: number,
    testSet: number,
    questions: any[],
    passages?: any[]
): TestProgress {
    return {
        id: generateProgressId(userId, testType, part, testSet),
        userId,
        testType,
        part,
        testSet,
        currentQuestion: 0,
        totalQuestions: questions.length,
        selectedAnswers: {},
        timeSpent: 0,
        startTime: Date.now(),
        lastSaved: Date.now(),
        completed: false,
        currentPassage: passages ? 0 : undefined,
        questions,
        passages
    }
}
