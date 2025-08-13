'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { TestProgress } from '@/types/progress'
import { progressStorage, createProgress } from '@/lib/progressStorage'
import { statsStorage } from '@/lib/statsStorage'

export default function ReadingPart6Page() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [questionsLoading, setQuestionsLoading] = useState(true)
    const [questionsError, setQuestionsError] = useState<string | null>(null)
    const [currentPassage, setCurrentPassage] = useState(0)
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
                currentPassage,
                selectedAnswers,
                timeSpent: Math.floor((Date.now() - startTime) / 1000)
            }
            setCurrentProgress(updatedProgress)
            progressStorage.saveProgress(updatedProgress)
        }
    }, [selectedAnswers, currentPassage, currentProgress, user, showResults, startTime])

    const loadUserProgress = async () => {
        if (!user?.uid) return

        try {
            const userProgress = await progressStorage.getUserProgress(user.uid)
            const part6Progress = userProgress.filter(p => p.testType === 'reading' && p.part === 6)
            setAvailableProgress(part6Progress)

            if (part6Progress.length > 0) {
                setShowResumeOption(true)
            }
        } catch (error) {
            console.error('Failed to load user progress:', error)
        }
    }

    const fetchQuestions = async (testSet: number = 1) => {
        try {
            setQuestionsLoading(true)
            const response = await fetch(`/api/questions?type=readingQuestions&part=6&testSet=${testSet}`)
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
                    const newProgress = createProgress(user.uid, 'reading', 6, testSet, result.data)
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
            const response = await fetch('/api/questions?type=readingQuestions&part=6')
            const result = await response.json()
            if (result.total) {
                const calculatedSets = Math.ceil(result.total / 16) // 16 questions per Part 6 test
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
            setCurrentPassage(progress.currentPassage || 0)
            setSelectedTestSet(progress.testSet)
            setTimeSpent(progress.timeSpent)
            setCurrentProgress(progress)
            setShowTestSelection(false)
            setShowResumeOption(false)

            console.log('Resumed Part 6 progress:', progress)
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

    const handleNext = async () => {
        if (currentPassage < Math.ceil(questions.length / 4) - 1) {
            setCurrentPassage(currentPassage + 1)
        } else {
            await completeTest()
        }
    }

    const handlePrevious = () => {
        if (currentPassage > 0) {
            setCurrentPassage(currentPassage - 1)
        }
    }

    const toggleExplanation = (questionId: string) => {
        setShowExplanation(prev => ({
            ...prev,
            [questionId]: !prev[questionId]
        }))
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
            timeSpent: Math.floor(timeSpent / 60)
        }
    }

    const getCorrectAnswerIndex = (question: any) => {
        if (question.correctAnswer) {
            return question.correctAnswer.charCodeAt(0) - 65
        }
        return 0
    }

    const getQuestionOptions = (question: any) => {
        if (question.choices && typeof question.choices === 'object' && !Array.isArray(question.choices)) {
            return [question.choices.A, question.choices.B, question.choices.C, question.choices.D].filter(Boolean)
        }
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
                                <h1 className="text-2xl font-bold text-gray-900">Part 6: Text Completion</h1>
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
                                    Mỗi bài test có 16 câu hỏi (4 đoạn văn × 4 câu). Chọn bài test bạn muốn luyện tập.
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
                                                                Đoạn {(progress.currentPassage || 0) + 1}/{Math.ceil((progress.totalQuestions || 16) / 4)}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                            {Math.floor(progress.timeSpent / 60)}:{(progress.timeSpent % 60).toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full"
                                                            style={{ width: `${(((progress.currentPassage || 0) + 1) / Math.ceil((progress.totalQuestions || 16) / 4)) * 100}%` }}
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
                                            className="bg-blue-600 text-white px-6 py-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="text-lg font-semibold">Test {i + 1}</div>
                                            <div className="text-sm opacity-90">16 câu hỏi</div>
                                        </button>
                                    ))}
                                </div>

                                {questionsLoading && (
                                    <div className="mt-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
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
                    <p className="text-gray-500 mb-4">Database chưa có dữ liệu cho Reading Part 6</p>

                </div>
            </div>
        )
    }

    if (showResults) {
        const score = calculateScore()
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <h1 className="text-3xl font-bold text-gray-900">Kết quả Part 6</h1>

                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        {/* Score Summary */}
                        <div className="bg-white shadow rounded-lg p-6 mb-8">
                            <div className="text-center">
                                <div className="text-6xl font-bold text-green-600 mb-4">
                                    {score.percentage}%
                                </div>
                                <div className="text-xl text-gray-700 mb-6">
                                    Bạn đã trả lời đúng {score.correct}/{score.total} câu
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                                    <div className="bg-blue-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-blue-600">{score.correct}</div>
                                        <div className="text-sm text-blue-600">Câu đúng</div>
                                    </div>
                                    <div className="bg-red-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-red-600">{score.total - score.correct}</div>
                                        <div className="text-sm text-red-600">Câu sai</div>
                                    </div>
                                    <div className="bg-gray-50 p-4 rounded-lg">
                                        <div className="text-2xl font-bold text-gray-600">{score.timeSpent}</div>
                                        <div className="text-sm text-gray-600">Phút hoàn thành</div>
                                    </div>
                                </div>
                                <div className="mt-6">
                                    <button
                                        onClick={() => {
                                            // Auto-refresh to show test selection with updated progress
                                            window.location.reload()
                                        }}
                                        className="bg-indigo-600 text-white px-6 py-2 rounded-md hover:bg-indigo-700 mr-4"
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
                                            setCurrentPassage(0)
                                            setShowResults(false)
                                            await fetchQuestions(selectedTestSet)
                                        }}
                                        className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 mr-4"
                                    >
                                        Làm lại test này
                                    </button>
                                    <Link
                                        href="/reading"
                                        className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700"
                                    >
                                        Về Reading
                                    </Link>
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
                    </div>
                </main>
            </div>
        )
    }

    // Group questions by passage (4 questions per passage)
    const currentPassageQuestions = questions.slice(currentPassage * 4, (currentPassage + 1) * 4)
    const totalPassages = Math.ceil(questions.length / 4)

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">

                            <h1 className="text-2xl font-bold text-gray-900">
                                Part 6: Test {selectedTestSet}
                            </h1>

                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Thời gian: {formatTime(timeSpent)}</span>
                            <span>Đoạn {currentPassage + 1}/{totalPassages}</span>
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
                            style={{ width: `${((currentPassage + 1) / totalPassages) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className={`grid ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                    {/* Quiz Content */}
                    <div className={`${showSidebar ? 'lg:col-span-3' : 'col-span-1'} px-4 py-6 sm:px-0`}>
                        <div className="bg-white shadow rounded-lg p-6">
                            {/* Instructions */}
                            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
                                <h3 className="font-semibold text-blue-900 mb-2">Hướng dẫn:</h3>
                                <p className="text-blue-800 text-sm">
                                    Đọc đoạn văn và chọn đáp án đúng nhất để điền vào chỗ trống.
                                    Part 6 kiểm tra cả ngữ pháp và ngữ cảnh của đoạn văn.
                                </p>
                            </div>

                            {/* Passage with Questions */}
                            <div className="space-y-6">
                                {currentPassageQuestions.map((question, index) => {
                                    const questionOptions = getQuestionOptions(question)
                                    return (
                                        <div key={question._id} className="border-l-4 border-indigo-500 pl-4">
                                            <h4 className="font-semibold text-gray-900 mb-3">
                                                Câu {currentPassage * 4 + index + 1}
                                            </h4>

                                            {/* Question Text/Passage */}
                                            <div className="mb-4 p-4 bg-gray-50 rounded-lg">
                                                <div className="text-gray-800 leading-relaxed">
                                                    {question.passage || question.question}
                                                </div>
                                            </div>

                                            {/* Answer Options */}
                                            <div className="space-y-3 mb-6">
                                                <h5 className="font-semibold text-gray-900">Chọn đáp án:</h5>
                                                {questionOptions.map((option: any, optIndex: number) => (
                                                    <label
                                                        key={optIndex}
                                                        className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${selectedAnswers[question._id] === optIndex
                                                            ? 'border-green-500 bg-green-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                    >
                                                        <input
                                                            type="radio"
                                                            name={`question-${question._id}`}
                                                            value={optIndex}
                                                            checked={selectedAnswers[question._id] === optIndex}
                                                            onChange={() => handleAnswerSelect(question._id, optIndex)}
                                                            className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                        />
                                                        <span className="ml-3 font-medium text-gray-900 text-lg">
                                                            {String.fromCharCode(65 + optIndex)}.
                                                        </span>
                                                        <span className="ml-2 text-gray-700">{option}</span>
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
                                        </div>
                                    )
                                })}
                            </div>

                            {/* Navigation */}
                            <div className="flex justify-between pt-6 border-t">
                                <button
                                    onClick={handlePrevious}
                                    disabled={currentPassage === 0}
                                    className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    ← Đoạn trước
                                </button>

                                <button
                                    onClick={handleNext}
                                    className="flex items-center px-6 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                                >
                                    {currentPassage === totalPassages - 1 ? 'Hoàn thành' : 'Đoạn tiếp theo'}
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
                                        Đoạn {currentPassage + 1}/{totalPassages}
                                    </span>
                                </div>

                                {/* Passage Progress Grid */}
                                <div className="grid grid-cols-4 gap-2 mb-4">
                                    {Array.from({ length: totalPassages }, (_, index) => {
                                        const passageQuestions = questions.slice(index * 4, (index + 1) * 4)
                                        const answeredCount = passageQuestions.filter(q =>
                                            selectedAnswers[q._id] !== undefined
                                        ).length
                                        const isCurrent = currentPassage === index
                                        const isCompleted = answeredCount === 4

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPassage(index)}
                                                className={`
                                                    w-12 h-12 text-xs font-medium rounded flex flex-col items-center justify-center transition-colors
                                                    ${isCurrent ? 'ring-2 ring-blue-500 ring-offset-1' : ''}
                                                    ${isCompleted
                                                        ? 'bg-blue-100 text-blue-800 border border-blue-300'
                                                        : answeredCount > 0
                                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                                    }
                                                `}
                                                title={`Đoạn ${index + 1} (${answeredCount}/4 câu)`}
                                            >
                                                <span className="text-xs">{index + 1}</span>
                                                <span className="text-xs">{answeredCount}/4</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Current Passage Questions */}
                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-900 mb-2">
                                        Đoạn {currentPassage + 1} - Câu hỏi:
                                    </h4>
                                    <div className="grid grid-cols-4 gap-1">
                                        {questions.slice(currentPassage * 4, (currentPassage + 1) * 4).map((question, index) => {
                                            const globalIndex = currentPassage * 4 + index
                                            const isAnswered = selectedAnswers[question._id] !== undefined

                                            return (
                                                <div
                                                    key={index}
                                                    className={`
                                                        w-8 h-8 text-xs font-medium rounded flex items-center justify-center
                                                        ${isAnswered
                                                            ? 'bg-green-100 text-green-800 border border-green-300'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-300'
                                                        }
                                                    `}
                                                    title={`Câu ${globalIndex + 1}${isAnswered ? ' (Đã trả lời)' : ' (Chưa trả lời)'}`}
                                                >
                                                    {globalIndex + 1}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Stats */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Đã trả lời:</span>
                                        <span className="font-medium text-green-600">
                                            {Object.keys(selectedAnswers).length}/{questions.length}
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
                                            // Jump to first incomplete passage
                                            const incompletePassage = Array.from({ length: totalPassages }, (_, i) => {
                                                const passageQuestions = questions.slice(i * 4, (i + 1) * 4)
                                                const answeredCount = passageQuestions.filter(q =>
                                                    selectedAnswers[q._id] !== undefined
                                                ).length
                                                return { passage: i, answered: answeredCount }
                                            }).find(p => p.answered < 4)

                                            if (incompletePassage) {
                                                setCurrentPassage(incompletePassage.passage)
                                            }
                                        }}
                                        className="w-full text-xs bg-blue-50 text-blue-700 px-3 py-2 rounded hover:bg-blue-100"
                                    >
                                        🎯 Tới đoạn chưa hoàn thành
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
