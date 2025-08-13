'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'
import { TestProgress } from '@/types/progress'
import { progressStorage, createProgress } from '@/lib/progressStorage'
import { statsStorage } from '@/lib/statsStorage'

export default function ReadingPart7Page() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [questions, setQuestions] = useState<any[]>([])
    const [questionsLoading, setQuestionsLoading] = useState(true)
    const [questionsError, setQuestionsError] = useState<string | null>(null)
    const [currentPassage, setCurrentPassage] = useState(0)
    const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({})
    const [showResults, setShowResults] = useState(false)
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
                timeSpent: Math.floor((Date.now() - startTime) / 1000),
                passages: questions // Store current grouped passages
            }
            setCurrentProgress(updatedProgress)
            progressStorage.saveProgress(updatedProgress)
        }
    }, [selectedAnswers, currentPassage, currentProgress, user, showResults, startTime, questions])

    const loadUserProgress = async () => {
        if (!user?.uid) return

        try {
            const userProgress = await progressStorage.getUserProgress(user.uid)
            const part7Progress = userProgress.filter(p => p.testType === 'reading' && p.part === 7)
            setAvailableProgress(part7Progress)

            if (part7Progress.length > 0) {
                setShowResumeOption(true)
            }
        } catch (error) {
            console.error('Failed to load user progress:', error)
        }
    }

    const fetchQuestions = async (testSet: number = 1) => {
        try {
            setQuestionsLoading(true)
            const response = await fetch(`/api/questions?type=readingQuestions&part=7&testSet=${testSet}`)
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch questions')
            }

            if (result.data && result.data.length > 0) {
                // Group questions by passage
                const groupedByPassage = groupQuestionsByPassage(result.data)
                setQuestions(groupedByPassage)
                setTotalSets(result.totalSets || 1)
                setSelectedTestSet(testSet)
                setShowTestSelection(false)

                // Create new progress
                if (user?.uid) {
                    const newProgress = createProgress(user.uid, 'reading', 7, testSet, result.data, groupedByPassage)
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
            const response = await fetch('/api/questions?type=readingQuestions&part=7')
            const result = await response.json()
            if (result.total) {
                const calculatedSets = Math.ceil(result.total / 5) // Assume 5 passages per test (flexible)
                setTotalSets(calculatedSets)
            }
        } catch (error) {
            console.error('Error fetching test sets info:', error)
            setQuestionsError('Không thể tải thông tin test sets')
        } finally {
            setQuestionsLoading(false)
        }
    }

    const groupQuestionsByPassage = (questions: any[]) => {
        // Handle Part 7 data structure with passageContent and questions array
        const grouped: any[] = []

        questions.forEach(item => {
            // Check if this is the new Part 7 structure with passageContent and questions array
            if (item.passageContent && item.questions && Array.isArray(item.questions)) {
                grouped.push({
                    id: item._id || item.passageTitle || 'passage',
                    passage: item.passageContent,
                    passageType: item.passageType || 'single',
                    passageTitle: item.passageTitle || '',
                    questions: item.questions.map((q: any) => ({
                        ...q,
                        _id: q.id || q._id,
                        question: q.question,
                        choices: q.choices,
                        correctAnswer: q.correctAnswer
                    }))
                })
            } else {
                // Handle old structure - group by passageId
                const passageId = item.passageId || item.passage || 'default'
                let existingGroup = grouped.find(g => g.id === passageId)

                if (!existingGroup) {
                    existingGroup = {
                        id: passageId,
                        passage: item.passage || '',
                        passageType: item.passageType || 'single',
                        questions: []
                    }
                    grouped.push(existingGroup)
                }
                existingGroup.questions.push(item)
            }
        })

        return grouped
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
            if (progress.passages) {
                setQuestions(progress.passages) // Use stored passages
            } else if (progress.questions) {
                // Fallback: regroup from raw questions
                const groupedByPassage = groupQuestionsByPassage(progress.questions)
                setQuestions(groupedByPassage)
            }
            setSelectedAnswers(progress.selectedAnswers)
            setCurrentPassage(progress.currentPassage || 0)
            setSelectedTestSet(progress.testSet)
            setTimeSpent(progress.timeSpent)
            setCurrentProgress(progress)
            setShowTestSelection(false)
            setShowResumeOption(false)

            console.log('Resumed Part 7 progress:', progress)
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
        if (currentPassage < questions.length - 1) {
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

    const calculateScore = () => {
        let correct = 0
        let total = 0

        questions.forEach(passage => {
            passage.questions.forEach((q: any) => {
                total++
                const correctAnswerIndex = getCorrectAnswerIndex(q)
                const questionId = q._id || q.id || `q_${q.id}`
                if (selectedAnswers[questionId] === correctAnswerIndex) {
                    correct++
                }
            })
        })

        return {
            correct,
            total,
            percentage: total > 0 ? Math.round((correct / total) * 100) : 0,
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
                                <h1 className="text-2xl font-bold text-gray-900">Part 7: Reading Comprehension</h1>
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
                                    Mỗi bài test gồm nhiều đoạn văn với các câu hỏi đọc hiểu. Chọn bài test bạn muốn luyện tập.
                                </p>

                                {/* Resume Progress Section */}
                                {availableProgress.length > 0 && (
                                    <div className="mb-8 p-6 bg-purple-50 border border-purple-200 rounded-lg">
                                        <h3 className="text-lg font-semibold text-purple-900 mb-4">
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
                                                                Đoạn {(progress.currentPassage || 0) + 1}/{progress.passages?.length || '?'}
                                                            </p>
                                                        </div>
                                                        <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
                                                            {Math.floor(progress.timeSpent / 60)}:{(progress.timeSpent % 60).toString().padStart(2, '0')}
                                                        </span>
                                                    </div>
                                                    <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                                                        <div
                                                            className="bg-purple-600 h-2 rounded-full"
                                                            style={{ width: `${progress.passages ? (((progress.currentPassage || 0) + 1) / progress.passages.length) * 100 : 0}%` }}
                                                        ></div>
                                                    </div>
                                                    <div className="flex space-x-2">
                                                        <button
                                                            onClick={() => resumeProgress(progress)}
                                                            className="flex-1 bg-purple-600 text-white px-3 py-2 rounded text-sm hover:bg-purple-700"
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
                                            className="bg-purple-600 text-white px-6 py-4 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <div className="text-lg font-semibold">Test {i + 1}</div>
                                            <div className="text-sm opacity-90">Đọc hiểu</div>
                                        </button>
                                    ))}
                                </div>

                                {questionsLoading && (
                                    <div className="mt-8">
                                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
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
                    <p className="text-gray-500 mb-4">Database chưa có dữ liệu cho Reading Part 7</p>

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
                            <h1 className="text-3xl font-bold text-gray-900">Kết quả Part 7: Test {selectedTestSet}</h1>

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
                    </div>
                </main>
            </div>
        )
    }

    const currentPassageData = questions[currentPassage]

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <h1 className="text-2xl font-bold text-gray-900">
                                Part 7: Test {selectedTestSet}
                            </h1>

                        </div>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>Thời gian: {formatTime(timeSpent)}</span>
                            <span>Đoạn {currentPassage + 1}/{questions.length}</span>
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
                            style={{ width: `${((currentPassage + 1) / questions.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className={`grid ${showSidebar ? 'grid-cols-1 lg:grid-cols-4' : 'grid-cols-1'} gap-6`}>
                    {/* Quiz Content */}
                    <div className={`${showSidebar ? 'lg:col-span-3' : 'col-span-1'} px-4 py-6 sm:px-0`}>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Passage */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <div className="mb-4">
                                    <h3 className="text-lg font-semibold text-gray-900">
                                        {currentPassageData.passageTitle || `Đoạn văn ${currentPassage + 1}`}
                                    </h3>
                                    <div className="flex items-center space-x-2 mt-2">
                                        {currentPassageData.passageType && (
                                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {currentPassageData.passageType}
                                            </span>
                                        )}
                                        <span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                                            {currentPassageData.questions.length} câu hỏi
                                        </span>
                                    </div>
                                </div>
                                <div className="prose max-w-none">
                                    <div className="text-gray-800 leading-relaxed whitespace-pre-line border-l-4 border-indigo-200 pl-4 bg-gray-50 p-4 rounded">
                                        {currentPassageData.passage}
                                    </div>
                                </div>
                            </div>

                            {/* Questions */}
                            <div className="bg-white shadow rounded-lg p-6">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                    Câu hỏi ({currentPassageData.questions.length} câu)
                                </h3>

                                <div className="space-y-6">
                                    {currentPassageData.questions.map((question: any, index: number) => {
                                        const questionOptions = getQuestionOptions(question)
                                        const questionId = question._id || question.id || `q_${question.id}`
                                        return (
                                            <div key={questionId} className="border-l-4 border-indigo-500 pl-4">
                                                <h4 className="font-semibold text-gray-900 mb-3">
                                                    Câu {index + 1}: {question.question}
                                                </h4>

                                                {/* Answer Options */}
                                                <div className="space-y-2">
                                                    {questionOptions.map((option: any, optIndex: number) => (
                                                        <label
                                                            key={optIndex}
                                                            className={`flex items-center p-3 border rounded-lg cursor-pointer transition ${selectedAnswers[questionId] === optIndex
                                                                ? 'border-green-500 bg-green-50'
                                                                : 'border-gray-200 hover:border-gray-300'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name={`question-${questionId}`}
                                                                value={optIndex}
                                                                checked={selectedAnswers[questionId] === optIndex}
                                                                onChange={() => handleAnswerSelect(questionId, optIndex)}
                                                                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300"
                                                            />
                                                            <span className="ml-3 font-medium text-gray-900">
                                                                {String.fromCharCode(65 + optIndex)}.
                                                            </span>
                                                            <span className="ml-2 text-gray-700">{option}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between mt-8">
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
                                {currentPassage === questions.length - 1 ? 'Hoàn thành' : 'Đoạn tiếp theo'}
                                →
                            </button>
                        </div>
                    </div>

                    {/* Sidebar - Progress Tracker */}
                    {showSidebar && (
                        <div className="lg:col-span-1">
                            <div className="bg-white shadow rounded-lg p-4 sticky top-4">
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className="font-semibold text-gray-900">Tiến trình</h3>
                                    <span className="text-sm text-gray-500">
                                        Đoạn {currentPassage + 1}/{questions.length}
                                    </span>
                                </div>

                                {/* Passage Progress Grid */}
                                <div className="grid grid-cols-3 gap-2 mb-4">
                                    {questions.map((passage, index) => {
                                        const answeredCount = passage.questions.filter((q: any) =>
                                            selectedAnswers[q._id || q.id] !== undefined
                                        ).length
                                        const totalQuestions = passage.questions.length
                                        const isCurrent = currentPassage === index
                                        const isCompleted = answeredCount === totalQuestions

                                        return (
                                            <button
                                                key={index}
                                                onClick={() => setCurrentPassage(index)}
                                                className={`
                                                    w-14 h-14 text-xs font-medium rounded flex flex-col items-center justify-center transition-colors
                                                    ${isCurrent ? 'ring-2 ring-purple-500 ring-offset-1' : ''}
                                                    ${isCompleted
                                                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                                                        : answeredCount > 0
                                                            ? 'bg-yellow-100 text-yellow-800 border border-yellow-300'
                                                            : 'bg-gray-100 text-gray-600 border border-gray-300 hover:bg-gray-200'
                                                    }
                                                `}
                                                title={`${passage.passageTitle || `Đoạn ${index + 1}`} (${answeredCount}/${totalQuestions} câu)`}
                                            >
                                                <span className="text-xs">{index + 1}</span>
                                                <span className="text-xs">{answeredCount}/{totalQuestions}</span>
                                            </button>
                                        )
                                    })}
                                </div>

                                {/* Current Passage Questions */}
                                {questions[currentPassage] && (
                                    <div className="mb-4">
                                        <h4 className="text-sm font-medium text-gray-900 mb-2">
                                            {questions[currentPassage].passageTitle || `Đoạn ${currentPassage + 1}`} - Câu hỏi:
                                        </h4>
                                        <div className="grid grid-cols-3 gap-1">
                                            {questions[currentPassage].questions.map((question: any, index: number) => {
                                                const questionId = question._id || question.id
                                                const isAnswered = selectedAnswers[questionId] !== undefined

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
                                                        title={`Câu ${index + 1}${isAnswered ? ' (Đã trả lời)' : ' (Chưa trả lời)'}`}
                                                    >
                                                        {index + 1}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )}

                                {/* Stats */}
                                <div className="border-t pt-4 space-y-2">
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Đã trả lời:</span>
                                        <span className="font-medium text-green-600">
                                            {Object.keys(selectedAnswers).length}/{questions.reduce((total: number, passage: any) => total + passage.questions.length, 0)}
                                        </span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-600">Thời gian:</span>
                                        <span className="font-medium text-purple-600">
                                            {formatTime(timeSpent)}
                                        </span>
                                    </div>
                                </div>

                                {/* Quick Actions */}
                                <div className="border-t pt-4 space-y-2">
                                    <button
                                        onClick={() => {
                                            // Jump to first incomplete passage
                                            const incompletePassage = questions.findIndex((passage: any) => {
                                                const answeredCount = passage.questions.filter((q: any) =>
                                                    selectedAnswers[q._id || q.id] !== undefined
                                                ).length
                                                return answeredCount < passage.questions.length
                                            })

                                            if (incompletePassage !== -1) {
                                                setCurrentPassage(incompletePassage)
                                            }
                                        }}
                                        className="w-full text-xs bg-purple-50 text-purple-700 px-3 py-2 rounded hover:bg-purple-100"
                                    >
                                        🎯 Tới đoạn chưa hoàn thành
                                    </button>

                                    <button
                                        onClick={() => {
                                            const totalQuestions = questions.reduce((total: number, passage: any) => total + passage.questions.length, 0)
                                            if (Object.keys(selectedAnswers).length === totalQuestions) {
                                                completeTest()
                                            } else {
                                                alert(`Còn ${totalQuestions - Object.keys(selectedAnswers).length} câu chưa trả lời!`)
                                            }
                                        }}
                                        className={`w-full text-xs px-3 py-2 rounded ${Object.keys(selectedAnswers).length === questions.reduce((total: number, passage: any) => total + passage.questions.length, 0)
                                            ? 'bg-green-600 text-white hover:bg-green-700'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                            }`}
                                        disabled={Object.keys(selectedAnswers).length !== questions.reduce((total: number, passage: any) => total + passage.questions.length, 0)}
                                    >
                                        ✅ Nộp bài ({Object.keys(selectedAnswers).length}/{questions.reduce((total: number, passage: any) => total + passage.questions.length, 0)})
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
