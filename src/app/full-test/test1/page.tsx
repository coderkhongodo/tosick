'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

// Sample mini test with few questions for demo
const testQuestions = {
    listening: [
        {
            id: 'L1',
            part: 1,
            type: 'listening',
            imageUrl: '/images/test1-L1.jpg',
            audioUrl: '/audio/test1-L1.mp3',
            options: ['The woman is reading a document.', 'The woman is writing notes.', 'The woman is using a computer.', 'The woman is making a phone call.'],
            correctAnswer: 2
        },
        {
            id: 'L2',
            part: 2,
            type: 'listening',
            audioUrl: '/audio/test1-L2.mp3',
            options: ['At 9 AM tomorrow.', 'In the conference room.', 'Yes, I will attend.', 'About 30 minutes.'],
            correctAnswer: 1
        }
    ],
    reading: [
        {
            id: 'R1',
            part: 5,
            type: 'reading',
            sentence: "The company has _____ a new policy regarding remote work.",
            options: ['implemented', 'implementing', 'implement', 'to implement'],
            correctAnswer: 0
        },
        {
            id: 'R2',
            part: 5,
            type: 'reading',
            sentence: "All employees must complete the training _____ Friday.",
            options: ['by', 'until', 'during', 'since'],
            correctAnswer: 0
        }
    ]
}

export default function Test1Page() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [hasStarted, setHasStarted] = useState(false)
    const [currentSection, setCurrentSection] = useState<'listening' | 'reading' | 'completed'>('listening')
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, number>>({})
    const [timeLeft, setTimeLeft] = useState(120 * 60) // 120 minutes in seconds
    const [isSubmitting, setIsSubmitting] = useState(false)
    const timerRef = useRef<NodeJS.Timeout>()

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (hasStarted && timeLeft > 0) {
            timerRef.current = setInterval(() => {
                setTimeLeft(prev => {
                    if (prev <= 1) {
                        handleSubmitTest()
                        return 0
                    }
                    return prev - 1
                })
            }, 1000)
        }

        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current)
            }
        }
    }, [hasStarted, timeLeft])

    const formatTime = (seconds: number) => {
        const hours = Math.floor(seconds / 3600)
        const minutes = Math.floor((seconds % 3600) / 60)
        const secs = seconds % 60
        return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    const handleStartTest = () => {
        setHasStarted(true)
    }

    const handleAnswerSelect = (questionId: string, answerIndex: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: answerIndex
        }))
    }

    const getCurrentQuestions = () => {
        return currentSection === 'listening' ? testQuestions.listening : testQuestions.reading
    }

    const getCurrentQuestion = () => {
        const questions = getCurrentQuestions()
        return questions[currentQuestionIndex]
    }

    const handleNext = () => {
        const questions = getCurrentQuestions()
        if (currentQuestionIndex < questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1)
        } else if (currentSection === 'listening') {
            // Move to reading section
            setCurrentSection('reading')
            setCurrentQuestionIndex(0)
        } else {
            // Complete test
            handleSubmitTest()
        }
    }

    const handlePrevious = () => {
        if (currentQuestionIndex > 0) {
            setCurrentQuestionIndex(currentQuestionIndex - 1)
        } else if (currentSection === 'reading') {
            // Go back to listening section
            setCurrentSection('listening')
            setCurrentQuestionIndex(testQuestions.listening.length - 1)
        }
    }

    const handleSubmitTest = () => {
        setIsSubmitting(true)
        setCurrentSection('completed')
        if (timerRef.current) {
            clearInterval(timerRef.current)
        }
    }

    const calculateScore = () => {
        let listeningCorrect = 0
        let readingCorrect = 0

        testQuestions.listening.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                listeningCorrect++
            }
        })

        testQuestions.reading.forEach(q => {
            if (answers[q.id] === q.correctAnswer) {
                readingCorrect++
            }
        })

        // Convert to TOEIC scale (simplified)
        const listeningScore = Math.round((listeningCorrect / testQuestions.listening.length) * 495)
        const readingScore = Math.round((readingCorrect / testQuestions.reading.length) * 495)
        const totalScore = listeningScore + readingScore

        return {
            listening: listeningScore,
            reading: readingScore,
            total: totalScore,
            listeningCorrect,
            readingCorrect,
            totalCorrect: listeningCorrect + readingCorrect,
            totalQuestions: testQuestions.listening.length + testQuestions.reading.length
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
            </div>
        )
    }

    if (!user) return null

    // Pre-test screen
    if (!hasStarted) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <h1 className="text-2xl font-bold text-gray-900">Đề thi thử TOEIC #1</h1>
                            <Link href="/full-test" className="text-indigo-600 hover:text-indigo-800">
                                ← Quay lại
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Sẵn sàng bắt đầu?</h2>
                            <p className="text-xl text-gray-600">
                                Bài thi sẽ bao gồm {testQuestions.listening.length + testQuestions.reading.length} câu hỏi
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 gap-8 mb-8">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-900 mb-4">📋 Cấu trúc bài thi</h3>
                                <div className="space-y-3 text-sm text-blue-800">
                                    <div className="flex justify-between">
                                        <span>Listening</span>
                                        <span>{testQuestions.listening.length} câu</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>Reading</span>
                                        <span>{testQuestions.reading.length} câu</span>
                                    </div>
                                    <hr className="border-blue-300" />
                                    <div className="flex justify-between font-semibold">
                                        <span>Tổng thời gian</span>
                                        <span>120 phút</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                                <h3 className="font-semibold text-red-900 mb-4">⚠️ Quy tắc quan trọng</h3>
                                <ul className="space-y-2 text-sm text-red-800">
                                    <li>• Timer sẽ đếm ngược từ 120 phút</li>
                                    <li>• Không được tạm dừng giữa chừng</li>
                                    <li>• Tự động nộp bài khi hết giờ</li>
                                    <li>• Có thể xem lại và sửa đáp án</li>
                                    <li>• Kết quả hiển thị ngay sau khi nộp</li>
                                </ul>
                            </div>
                        </div>

                        <div className="text-center">
                            <button
                                onClick={handleStartTest}
                                className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition duration-300"
                            >
                                Bắt đầu làm bài
                            </button>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Results screen
    if (currentSection === 'completed') {
        const score = calculateScore()
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <h1 className="text-2xl font-bold text-gray-900">Kết quả thi</h1>
                            <Link href="/full-test" className="text-indigo-600 hover:text-indigo-800">
                                Về danh sách đề thi
                            </Link>
                        </div>
                    </div>
                </header>

                <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="bg-white shadow rounded-lg p-8">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-gray-900 mb-4">Hoàn thành!</h2>
                            <div className="text-6xl font-bold text-indigo-600 mb-4">{score.total}</div>
                            <p className="text-xl text-gray-600">
                                Điểm TOEIC của bạn
                            </p>
                        </div>

                        {/* Score Breakdown */}
                        <div className="grid md:grid-cols-2 gap-6 mb-8">
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                                <h3 className="font-semibold text-blue-900 mb-4">Listening</h3>
                                <div className="text-3xl font-bold text-blue-600 mb-2">{score.listening}</div>
                                <p className="text-sm text-blue-800">
                                    {score.listeningCorrect}/{testQuestions.listening.length} câu đúng
                                </p>
                            </div>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                                <h3 className="font-semibold text-green-900 mb-4">Reading</h3>
                                <div className="text-3xl font-bold text-green-600 mb-2">{score.reading}</div>
                                <p className="text-sm text-green-800">
                                    {score.readingCorrect}/{testQuestions.reading.length} câu đúng
                                </p>
                            </div>
                        </div>

                        {/* Performance Level */}
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 mb-8">
                            <h3 className="font-semibold text-gray-900 mb-4">Đánh giá năng lực</h3>
                            <div className="text-center">
                                {score.total >= 860 && (
                                    <div className="text-green-600">
                                        <div className="text-2xl font-bold">Excellent</div>
                                        <p>Trình độ tiếng Anh rất tốt</p>
                                    </div>
                                )}
                                {score.total >= 730 && score.total < 860 && (
                                    <div className="text-blue-600">
                                        <div className="text-2xl font-bold">Good</div>
                                        <p>Trình độ tiếng Anh tốt</p>
                                    </div>
                                )}
                                {score.total >= 470 && score.total < 730 && (
                                    <div className="text-yellow-600">
                                        <div className="text-2xl font-bold">Fair</div>
                                        <p>Trình độ tiếng Anh trung bình</p>
                                    </div>
                                )}
                                {score.total < 470 && (
                                    <div className="text-red-600">
                                        <div className="text-2xl font-bold">Needs Improvement</div>
                                        <p>Cần cải thiện thêm</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-center space-x-4">
                            <Link
                                href="/full-test/test1"
                                className="bg-indigo-600 text-white px-6 py-3 rounded-md hover:bg-indigo-700"
                            >
                                Làm lại
                            </Link>
                            <Link
                                href="/full-test"
                                className="bg-gray-600 text-white px-6 py-3 rounded-md hover:bg-gray-700"
                            >
                                Chọn đề khác
                            </Link>
                            <Link
                                href="/dashboard"
                                className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
                            >
                                Về Dashboard
                            </Link>
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    const question = getCurrentQuestion()
    const questions = getCurrentQuestions()
    const totalQuestions = testQuestions.listening.length + testQuestions.reading.length
    const currentQuestionNumber = currentSection === 'listening'
        ? currentQuestionIndex + 1
        : testQuestions.listening.length + currentQuestionIndex + 1

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header with Timer */}
            <header className="bg-white shadow sticky top-0 z-10">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-4">
                        <div className="flex items-center space-x-4">
                            <h1 className="text-xl font-bold text-gray-900">
                                TOEIC Test #1
                            </h1>
                            <span className="text-sm text-gray-600">
                                {currentSection === 'listening' ? 'Listening' : 'Reading'} -
                                Câu {currentQuestionNumber}/{totalQuestions}
                            </span>
                        </div>

                        {/* Timer */}
                        <div className={`text-lg font-mono font-bold px-4 py-2 rounded-lg ${timeLeft < 600 ? 'bg-red-100 text-red-700' :
                                timeLeft < 1800 ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-green-100 text-green-700'
                            }`}>
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="bg-white border-b">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${(currentQuestionNumber / totalQuestions) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="max-w-6xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="p-8">
                        {/* Section Header */}
                        <div className="mb-6 p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                            <h3 className="font-semibold text-indigo-900 mb-2">
                                {currentSection === 'listening' ? `Part ${question.part}: Listening` : `Part ${question.part}: Reading`}
                            </h3>
                            <p className="text-indigo-800 text-sm">
                                {currentSection === 'listening'
                                    ? 'Nghe và chọn đáp án phù hợp nhất.'
                                    : 'Đọc và chọn đáp án phù hợp nhất.'
                                }
                            </p>
                        </div>

                        {/* Question Content */}
                        <div className="mb-8">
                            {currentSection === 'listening' ? (
                                <div className="grid md:grid-cols-2 gap-8">
                                    {/* Image for Part 1 */}
                                    {question.part === 1 && (
                                        <div>
                                            <h4 className="font-semibold text-gray-900 mb-3">Hình ảnh</h4>
                                            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center">
                                                <div className="text-center p-8">
                                                    <div className="w-24 h-24 bg-gray-300 rounded-lg mx-auto mb-4 flex items-center justify-center">
                                                        <svg className="w-12 h-12 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-gray-500 text-sm">Listening Image #{currentQuestionIndex + 1}</p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Audio Player */}
                                    <div>
                                        <h4 className="font-semibold text-gray-900 mb-3">Audio</h4>
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <div className="flex items-center space-x-4 mb-4">
                                                <button className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                                                    ▶ Phát audio
                                                </button>
                                                <span className="text-sm text-gray-600">
                                                    (Audio sẽ tự động phát trong bài thi thật)
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                // Reading question
                                <div>
                                    <h4 className="font-semibold text-gray-900 mb-3">Hoàn thành câu sau:</h4>
                                    <div className="bg-gray-50 p-6 rounded-lg border-l-4 border-green-500">
                                        <p className="text-xl text-gray-800 leading-relaxed">
                                            {question.sentence}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Answer Options */}
                        <div className="space-y-3 mb-8">
                            <h4 className="font-semibold text-gray-900">Chọn đáp án:</h4>
                            {question.options.map((option, index) => (
                                <label
                                    key={index}
                                    className={`flex items-center p-4 border rounded-lg cursor-pointer transition ${answers[question.id] === index
                                            ? 'border-indigo-500 bg-indigo-50'
                                            : 'border-gray-200 hover:border-gray-300'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name={`question-${question.id}`}
                                        value={index}
                                        checked={answers[question.id] === index}
                                        onChange={() => handleAnswerSelect(question.id, index)}
                                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                    />
                                    <span className="ml-3 font-medium text-gray-900 text-lg">
                                        {String.fromCharCode(65 + index)}.
                                    </span>
                                    <span className="ml-2 text-gray-700 text-lg">{option}</span>
                                </label>
                            ))}
                        </div>

                        {/* Navigation */}
                        <div className="flex justify-between items-center">
                            <button
                                onClick={handlePrevious}
                                disabled={currentSection === 'listening' && currentQuestionIndex === 0}
                                className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                ← Câu trước
                            </button>

                            <div className="flex space-x-4">
                                <button
                                    onClick={handleSubmitTest}
                                    className="px-4 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50"
                                >
                                    Nộp bài
                                </button>

                                <button
                                    onClick={handleNext}
                                    disabled={answers[question.id] === undefined}
                                    className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {currentSection === 'reading' && currentQuestionIndex === questions.length - 1
                                        ? 'Hoàn thành'
                                        : currentSection === 'listening' && currentQuestionIndex === questions.length - 1
                                            ? 'Sang Reading'
                                            : 'Câu tiếp theo'
                                    }
                                    →
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}
