export interface Question {
    id: string
    part: 1 | 2 | 3 | 4 | 5 | 6 | 7
    type: 'listening' | 'reading'
    content: QuestionContent
    answers: Answer[]
    correctAnswer: string
    explanation: string
    difficulty: 'easy' | 'medium' | 'hard'
    tags: string[]
}

export interface QuestionContent {
    // For Listening Parts
    audioUrl?: string
    imageUrl?: string // Part 1 has images
    transcript?: string

    // For Reading Parts
    passage?: string
    question?: string

    // Common
    instructions?: string
}

export interface Answer {
    id: string
    text: string
    isCorrect: boolean
}

export interface ListeningPart1Question extends Question {
    part: 1
    type: 'listening'
    content: {
        audioUrl: string
        imageUrl: string
        instructions: string
    }
}

export interface ReadingPart5Question extends Question {
    part: 5
    type: 'reading'
    content: {
        passage: string
        question: string
        instructions: string
    }
}

export interface TestSession {
    id: string
    userId: string
    questions: Question[]
    userAnswers: Record<string, string> // questionId -> selectedAnswerId
    startTime: Date
    endTime?: Date
    score?: {
        correct: number
        total: number
        percentage: number
    }
    timeSpent: number // in seconds
}
