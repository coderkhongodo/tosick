'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { TestProgress } from '@/types/progress'
import { progressStorage, createProgress } from '@/lib/progressStorage'
import { statsStorage } from '@/lib/statsStorage'

// Questions will be loaded from MongoDB

export default function ReadingPart5Page() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [questionsLoading, setQuestionsLoading] = useState(true)
    const [questionsError, setQuestionsError] = useState<string | null>(null)
    const [currentQuestion, setCurrentQuestion] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
    const [showResults, setShowResults] = useState(false)
    const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({})
    const [startTime] = useState(Date.now())
    const [timeSpent, setTimeSpent] = useState(0)
    const [selectedTestSet, setSelectedTestSet] = useState(1)
    const [totalSets, setTotalSets] = useState(1)
    const [showTestSelection, setShowTestSelection] = useState(true)
    const [currentProgress, setCurrentProgress] = useState<TestProgress | null>(null)
    const [availableProgress, setAvailableProgress] = useState<TestProgress[]>([])
    const [showResumeOption, setShowResumeOption] = useState(false)
    const [showSidebar, setShowSidebar] = useState(true)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            fetchAvailableTestSets()
            loadUserProgress()
        }
    }, [user])

    // Auto-save progress when answers change
    useEffect(() => {
        if (currentProgress && user && !showResults) {
            const updatedProgress = {
                ...currentProgress,
                currentQuestion,
                selectedAnswers,
                timeSpent: Math.floor((Date.now() - startTime) / 1000)
            }
            setCurrentProgress(updatedProgress)
            progressStorage.saveProgress(updatedProgress)
        }
    }, [selectedAnswers, currentQuestion, currentProgress, user, showResults, startTime])

    const loadUserProgress = async () => {
        if (!user?.uid) return

        try {
            const userProgress = await progressStorage.getUserProgress(user.uid)
            const part5Progress = userProgress.filter(p => p.testType === 'reading' && p.part === 5)
            setAvailableProgress(part5Progress)

            if (part5Progress.length > 0) {
                setShowResumeOption(true)
            }
        } catch (error) {
            console.error('Failed to load user progress:', error)
        }
    }

    const fetchQuestions = async (testSet: number = 1) => {
        try {
            setQuestionsLoading(true)
            const response = await fetch(`/api/questions?type=readingQuestions&part=5&testSet=${testSet}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch questions')
            }

            if (result.data && result.data.length > 0) {
                setQuestions(result.data)
                setTotalSets(result.totalSets || 1)
                setSelectedTestSet(testSet)
                setShowTestSelection(false)

                // Create new progress
                if (user?.uid) {
                    const newProgress = createProgress(user.uid, 'reading', 5, testSet, result.data)
                    setCurrentProgress(newProgress)
                    await progressStorage.saveProgress(newProgress)
                }
            } else {
                setQuestions([])
            }
        } catch (error) {
            setQuestionsError(error instanceof Error ? error.message : 'Unknown error')
            console.error('Error fetching questions:', error)
        } finally {
            setQuestionsLoading(false)
        }
    }

    const fetchAvailableTestSets = async () => {
        try {
            setQuestionsLoading(true)
            const response = await fetch('/api/questions?type=readingQuestions&part=5')
            const result = await response.json()
            if (result.total) {
                const calculatedSets = Math.ceil(result.total / 30)
                setTotalSets(calculatedSets)
            }
        } catch (error) {
            console.error('Error fetching test sets info:', error)
            setQuestionsError('Không thể tải thông tin test sets')
        } finally {
            setQuestionsLoading(false)
        }
    }

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeSpent(Math.floor((Date.now() - startTime) / 1000))
        }, 1000)

        return () => clearInterval(timer)
    }, [startTime])

    const resumeProgress = async (progress: TestProgress) => {
        try {
            // Restore state from saved progress
            setQuestions(progress.questions || [])
            setSelectedAnswers(progress.selectedAnswers)
            setCurrentQuestion(progress.currentQuestion)
            setSelectedTestSet(progress.testSet)
            setTimeSpent(progress.timeSpent)
            setCurrentProgress(progress)
            setShowTestSelection(false)
            setShowResumeOption(false)

            console.log('Resumed progress:', progress)
        } catch (error) {
            console.error('Failed to resume progress:', error)
        }
    }

    const completeTest = async () => {
        const finalTimeSpent = Math.floor((Date.now() - startTime) / 60000) // Convert to minutes
        const score = calculateScore()

        // Update user study stats in MongoDB
        if (user?.uid) {
            try {
                await fetch('/api/user/study-stats', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        uid: user.uid,
                        studyTime: finalTimeSpent,
                        testCompleted: true
                    }),
                })
            } catch (error) {
                console.error('Error updating study stats:', error)
            }
        }

        if (currentProgress && user?.uid) {
            // Mark progress as completed and delete it
            const completedProgress = {
                ...currentProgress,
                completed: true,
                timeSpent: Math.floor((Date.now() - startTime) / 1000)
            }

            await progressStorage.deleteProgress(currentProgress.id, user.uid)
            setCurrentProgress(null)
        }

        setShowResults(true)
    }

    const handleAnswerSelect = (questionId: string, answerIndex: number) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }))
    }

    const toggleExplanation = (questionId: string) => {
        setShowExplanation(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }))
    }

    const handleNext = async () => {
        if (currentQuestion < questions.length - 1) {
            setCurrentQuestion(currentQuestion + 1)
        } else {
            await completeTest()
        }
    }

    const handlePrevious = () => {
        if (currentQuestion > 0) {
            setCurrentQuestion(currentQuestion - 1)
        }
    }

    const calculateScore = () => {
        let correct = 0
        questions.forEach((q, index) => {
            const correctAnswerIndex = getCorrectAnswerIndex(q)
            if (selectedAnswers[q._id] === correctAnswerIndex) {
                correct++
            }
        })
        return {
            correct,
            total: questions.length,
            percentage: Math.round((correct / questions.length) * 100),
            timeSpent: Math.floor(timeSpent / 60) // in minutes
        }
    }

    const getCorrectAnswerIndex = (question: any) => {
        if (question.correctAnswer) {
            // Convert A, B, C, D to 0, 1, 2, 3
            return question.correctAnswer.charCodeAt(0) - 65
        }
        return 0
    }

    const getPartInfo = (question: any) => {
        if (question.part && typeof question.part === 'object') {
            return `Part ${question.part.number}: ${question.part.name}`
        } else if (question.part) {
            return `Part ${question.part}`
        }
        return 'Part 5: Incomplete Sentences'
    }

    const getQuestionOptions = (question: any) => {
        // Handle object format: {"A": "text", "B": "text", ...}
        if (question.choices && typeof question.choices === 'object' && !Array.isArray(question.choices)) {
            return [question.choices.A, question.choices.B, question.choices.C, question.choices.D].filter(Boolean)
        }
        // Handle array format: ["text1", "text2", ...]
        if (question.choices && Array.isArray(question.choices)) {
            return question.choices
        }
        if (question.options && Array.isArray(question.options)) {
            return question.options
        }
        return ['Option A', 'Option B', 'Option C', 'Option D']
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (loading || questionsLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-gray-600">
                    {loading ? 'Đang xác thực...' : 'Đang tải câu hỏi từ database...'}
                </p>
            </div>
        )
    }

    if (!user) return null

    if (showTestSelection) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <button
                                    onClick={() => window.location.href = '/reading'}
                                    className="text-indigo-600 hover:text-indigo-500 mr-4"
                                >
                                    ← Quay lại
                                </button>
                                <h1 className="text-2xl font-bold text-gray-900">Part 5: Incomplete Sentences</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="bg-white shadow rounded-lg p-8">
                            <div className="text-center">
                                <h2 className="text-3xl font-bold text-gray-900 mb-4">Chọn bài test</h2>
                                <p className="text-gray-600 mb-8">
                                    Mỗi bài test có 30 câu hỏi. Chọn bài test bạn muốn luyện tập.
                                </p>

                                {/* Resume Progress Section */}
                                {availableProgress.length > 0 && (
                                    <div className="mb-8 p-6 bg-blue-50 border border-blue-200 rounded-lg">
                                        <h3 className="text-lg font-semibold text-blue-900 mb-4">
                                            📚 Tiếp tục bài test đã dừng
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {availableProgress.map((progress) => (
                                                <div key={progress.id} className="bg-white p-4 rounded-lg border">
                                                    <div className="flex justify-between items-start mb-3">
                                                        <div>
                                                            <h4 className="font-semibold text-gray-900">
                                                                Test {progress.testSet}
                                                            </h4>
                                                            <p className="text-sm text-gray-600">
                                                                Câu {progress.currentQuestion + 1}/{progress.totalQuestions}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {Math.floor(progress.timeSpent / 60)}:{(progress.timeSpent % 60).toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${((progress.currentQuestion + 1) / progress.totalQuestions) * 100}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => resumeProgress(progress)}
                                                            className="flex-1 bg-blue-600 text-white px-3 py-2 rounded text-sm hover:bg-blue-700"
                                                        >
                                                            Tiếp tục
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                await progressStorage.deleteProgress(progress.id, user?.uid || '')
                                                                // Force reload progress list
                                                                await loadUserProgress()
                                                                // Also clear any cached progress if it matches current
                                                                if (currentProgress?.id === progress.id) {
                                                                    setCurrentProgress(null)
                                                                }
                                                            }}
                                                            className="flex-1 bg-red-600 text-white px-3 py-2 rounded text-sm hover:bg-red-700"
                                                        >
                                                            Xóa
                                                        </button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-w-2xl mx-auto">
                                    {Array.from({ length: totalSets }, (_, i) => (
                                        <button
                                            key={i + 1}
                                            onClick={() => {
                                                fetchQuestions(i + 1)
                                            }}
                                            disabled={questionsLoading}
                                            className="bg-indigo-600 text-white px-6 py-4 rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="text-lg font-semibold">Test {i + 1}</div>
                                            <div className="text-sm opacity-90">30 câu hỏi</div>
                                        </button>
                                    ))}
                                </div>

                                {questionsLoading && (
                                    <div className="mt-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
                                        <p className="text-gray-600 mt-2">Đang tải bài test...</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    if (questionsError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">Lỗi tải dữ liệu</div>
                    <p className="text-gray-600 mb-4">{questionsError}</p>
                    <button
                        onClick={() => fetchQuestions(1)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    if (questions.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-xl mb-4">Không có câu hỏi</div>
                    <p className="text-gray-500 mb-4">Database chưa có dữ liệu cho Part 5</p>

                </div>
            </div>
        )
    }

    if (showResults) {
        const score = calculateScore()
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <h1 className="text-2xl font-bold text-gray-900">Kết quả Part 5</h1>

                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoàn thành!</h2>
                            <div className="grid grid-cols-2 gap-6 mb-6">
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-indigo-600 mb-2">{score.percentage}%</div>
                                    <p className="text-gray-600">Điểm số</p>
                                </div>
                                <div className="text-center">
                                    <div className="text-4xl font-bold text-green-600 mb-2">{score.timeSpent}m</div>
                                    <p className="text-gray-600">Thời gian</p>
                                </div>
                            </div>
                            <p className="text-xl text-gray-600">
                                Bạn đã trả lời đúng {score.correct}/{score.total} câu
                            </p>
                        </div>

                        {/* Performance Analysis */}
                        <div className="mb-8">
                            <h3 className="text-xl font-semibold text-gray-900 mb-4">Phân tích kết quả</h3>
                            <div className="grid md:grid-cols-3 gap-4">
                                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-green-800 mb-2">Điểm mạnh</h4>
                                    <ul className="text-sm text-green-700 space-y-1">
                                        <li>• Ngữ pháp cơ bản</li>
                                        <li>• Thì động từ</li>
                                    </ul>
                                </div>
                                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-yellow-800 mb-2">Cần cải thiện</h4>
                                    <ul className="text-sm text-yellow-700 space-y-1">
                                        <li>• Dạng từ (Word forms)</li>
                                        <li>• Giới từ</li>
                                    </ul>
                                </div>
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-semibold text-blue-800 mb-2">Gợi ý</h4>
                                    <ul className="text-sm text-blue-700 space-y-1">
                                        <li>• Luyện thêm Word forms</li>
                                        <li>• Đọc kỹ đề bài</li>
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Detailed Results */}
                        <div className="space-y-6">
                            <h3 className="text-xl font-semibold text-gray-900">Chi tiết câu trả lời</h3>
                            {questions.map((question, index) => {
                                const userAnswer = selectedAnswers[question._id]
                                const correctAnswerIndex = getCorrectAnswerIndex(question)
                                const isCorrect = userAnswer === correctAnswerIndex
                                const options = getQuestionOptions(question)
                                return (
                                    <div key={question._id} className={`border rounded-lg p-4 ${isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="font-semibold">Câu {index + 1}</span>
                                            <div className="flex items-center space-x-2">
                                                <span className={`px-2 py-1 rounded text-sm font-medium ${isCorrect ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>
                                                    {isCorrect ? 'Đúng' : 'Sai'}
                                                </span>
                                                {question.grammarPoint && (
                                                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                                                        {question.grammarPoint}
                                                    </span>
                                                )}
                                                <span className="text-xs text-blue-500 bg-blue-50 px-2 py-1 rounded">
                                                    {getPartInfo(question)}
                                                </span>
                                            </div>
                                        </div>
                                        <p className="text-gray-800 mb-3 font-medium">
                                            {question.question || question.sentence}
                                        </p>
                                        <div className="space-y-2 mb-3">
                                            {options.map((option: any, optIndex: number) => (
                                                <div key={optIndex} className={`text-sm p-2 rounded ${optIndex === correctAnswerIndex ? 'bg-green-100 text-green-800 font-medium' :
                                                    optIndex === userAnswer && optIndex !== correctAnswerIndex ? 'bg-red-100 text-red-800' :
                                                        'text-gray-600'
                                                    }`}>
                                                    {String.fromCharCode(65 + optIndex)}. {option}
                                                    {optIndex === correctAnswerIndex && ' ✓'}
                                                    {optIndex === userAnswer && optIndex !== correctAnswerIndex && ' ✗'}
                                                </div>
                                            ))}
                                        </div>
                                        {question.explanation && (
                                            <div className="text-sm text-gray-700 bg-blue-50 p-3 rounded">
                                                <strong>Giải thích:</strong> {question.explanation}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="mt-8 flex justify-center space-x-4">
                            <button
                                onClick={() => {
                                    // Auto-refresh to show test selection with updated progress
                                    window.location.reload()
                                }}
                                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                            >
                                Chọn test khác
                            </button>
                            <button
                                onClick={async () => {
                                    // Clear current progress and start fresh
                                    if (currentProgress && user?.uid) {
                                        await progressStorage.deleteProgress(currentProgress.id, user.uid)
                                    }
                                    setCurrentProgress(null)
                                    setSelectedAnswers({})
                                    setCurrentQuestion(0)
                                    setShowResults(false)
                                    await fetchQuestions(selectedTestSet)
                                }}
                                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                            >
                                Làm lại test này
                            </button>

                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Main quiz interface  
    const question = questions[currentQuestion]
    const questionOptions = getQuestionOptions(question)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">

                            <h1 className="text-2xl font-bold text-gray-900">Part 5: Incomplete Sentences</h1>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Thời gian: {formatTime(timeSpent)}</span>
                            <span>Câu {currentQuestion + 1}/{questions.length}</span>
                            <button
                                onClick={() => setShowSidebar(!showSidebar)}
                                className="bg-gray-500 text-white px-3 py-1 rounded text-xs hover:bg-gray-600 mr-2"
                                title={showSidebar ? 'Ẩn sidebar' : 'Hiện sidebar'}
                            >
                                {showSidebar ? '👁️‍🗨️' : '👁️'}
                            </button>
                            <button
                                onClick={() => {
                                    // Auto-refresh page to show updated progress
                                    if (confirm('Lưu tiến trình và quay lại trang chọn test?')) {
                                        window.location.reload()
                                    }
                                }}
                                className="bg-yellow-500 text-white px-3 py-1 rounded text-xs hover:bg-yellow-600"
                            >
                                💾 Lưu & Thoát
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className={`grid ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                    {/* Quiz Content */}
                    <div className={`${showSidebar ? 'lg:col-span-3' : 'col-span-1'} bg-white shadow rounded-lg overflow-hidden`}>
                        <div className="p-8">
                            {/* Instructions */}
                            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <h3 className="font-semibold text-green-900 mb-2">Hướng dẫn:</h3>
                                <p className="text-green-800 text-sm">
                                    Chọn từ hoặc cụm từ phù hợp nhất để hoàn thành câu. Chú ý đến ngữ pháp và ngữ cảnh.
                                </p>
                            </div>

                            {/* Question Info */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex items-center space-x-3">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        {question.grammarPoint}
                                    </span>
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${question.difficulty === 'easy' ? 'bg-green-100 text-green-800' :
                                        question.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {question.difficulty === 'easy' ? 'Dễ' :
                                            question.difficulty === 'medium' ? 'Trung bình' : 'Khó'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold text-gray-900">#{currentQuestion + 1}</div>
                                    <div className="text-sm text-gray-500">Part 5</div>
                                </div>
                            </div>

                            {/* Question */}
                            <div className="mb-8">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Hoàn thành câu sau:</h3>
                                <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                                    <p className="text-xl text-gray-800 leading-relaxed">
                                        {(question.question || question.sentence || '').split('_____').map((part: any, index: number) => (
                                            <span key={index}>
                                                {part}
                                                {index < (question.question || question.sentence || '').split('_____').length - 1 && (
                                                    <span className="inline-block w-20 h-8 bg-white border-2 border-dashed border-green-400 mx-2 rounded align-middle"></span>
                                                )}
                                            </span>
                                        ))}
                                    </p>
                                </div>
                            </div>

                            {/* Answer Options */}
                            <div className="space-y-3 mb-8">
                                <h4 className="font-semibold text-gray-900">Chọn đáp án:</h4>
                                {questionOptions.map((option: any, index: number) => (
                                    <label
                                        key={index}
                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedAnswers[question._id] === index
                                            ? 'border-green-500 bg-green-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name={`question-${question._id}`}
                                            value={index}
                                            checked={selectedAnswers[question._id] === index}
                                            onChange={() => handleAnswerSelect(question._id, index)}
                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                        />
                                        <span className="ml-3 font-medium text-gray-900 text-lg">
                                            {String.fromCharCode(65 + index)}.
                                        </span>
                                        <span className="ml-2 text-gray-700 text-lg">{option}</span>
                                    </label>
                                ))}
                            </div>

                            {/* Show Explanation Button */}
                            {selectedAnswers[question._id] !== undefined && (
                                <div className="mb-6">
                                    <button
                                        onClick={() => toggleExplanation(question._id)}
                                        className="text-green-600 hover:text-green-800 text-sm font-medium"
                                    >
                                        {showExplanation[question._id] ? 'Ẩn giải thích' : 'Xem giải thích'}
                                    </button>

                                    {showExplanation[question._id] && (
                                        <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                                            <div className="text-sm text-blue-800">
                                                <strong>Đáp án đúng:</strong> {question.correctAnswer}. {question.choices[question.correctAnswer]}
                                            </div>
                                            {question.explanation && (
                                                <div className="mt-2 text-sm text-blue-800">
                                                    <strong>Giải thích:</strong> {question.explanation}
                                                </div>
                                            )}
                                            {question.keywords && question.keywords.length > 0 && (
                                                <div className="mt-2 text-xs text-blue-600">
                                                    <strong>Từ khóa:</strong> {question.keywords.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Navigation Buttons */}
                            <div className="flex justify-between">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentQuestion === 0}
                                    className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Câu trước
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={selectedAnswers[question._id] === undefined}
                                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentQuestion === questions.length - 1 ? 'Hoàn thành' : 'Câu tiếp theo'}
                                    →
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar - Progress Tracker */}
                    {showSidebar && (
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow rounded-lg p-4 sticky top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Tiến trình</h3>
                                    <span className="text-sm text-gray-500">
                                        {Object.keys(selectedAnswers).length}/{questions.length}
                                    </span>
                                </div>

                                {/* Progress Grid */}
                                <div className="grid grid-cols-5 gap-2 mb-4">
                                    {questions.map((_, index) => {
                                        const isAnswered = selectedAnswers[questions[index]._id] !== undefined
                                        const isCurrent = currentQuestion === index
                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentQuestion(index)}
                                                className={`
                                                    w-8 h-8 text-xs font-medium rounded flex items-center justify-center transition-colors
                                                    ${isCurrent ? 'ring-2 ring-indigo-500 ring-offset-1' : ''}
                                                    ${isAnswered
                                                        ? 'bg-green-100 text-green-800 border border-green-300'
                                                        : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                                    }
                                                `}
                                                title={`Câu ${index + 1}${isAnswered ? ' (Đã trả lời)' : ' (Chưa trả lời)'}`}
                                            >
                                                {index + 1}
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Stats */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Đã trả lời:</span>
                                        <span className="font-medium text-green-600">
                                            {Object.keys(selectedAnswers).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Còn lại:</span>
                                        <span className="font-medium text-orange-600">
                                            {questions.length - Object.keys(selectedAnswers).length}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Thời gian:</span>
                                        <span className="font-medium text-blue-600">
                                            {formatTime(timeSpent)}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="border-t pt-4 space-y-2">
                                    <button
                                        onClick={() => {
                                            // Jump to first unanswered question
                                            const firstUnanswered = questions.findIndex((q, i) =>
                                                selectedAnswers[q._id] === undefined
                                            )
                                            if (firstUnanswered !== -1) {
                                                setCurrentQuestion(firstUnanswered)
                                            }
                                        }}
                                        className="w-full text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100"
                                    >
                                        🎯 Tới câu chưa làm
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (Object.keys(selectedAnswers).length === questions.length) {
                                                completeTest()
                                            } else {
                                                alert(`Còn ${questions.length - Object.keys(selectedAnswers).length} câu chưa trả lời!`)
                                            }
                                        }}
                                        className={`w-full text-xs px-3 py-2 rounded ${Object.keys(selectedAnswers).length === questions.length
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                        disabled={Object.keys(selectedAnswers).length !== questions.length}
                                    >
                                        ✅ Nộp bài ({Object.keys(selectedAnswers).length}/{questions.length})
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}
