'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

// Vocabulary data will be loaded from MongoDB

export default function VocabularyPage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [vocabularyTopics, setVocabularyTopics] = useState<any[]>([])
    const [vocabularyLoading, setVocabularyLoading] = useState(true)
    const [vocabularyError, setVocabularyError] = useState<string | null>(null)
    const [selectedTopic, setSelectedTopic] = useState<string | null>(null)
    const [studyMode, setStudyMode] = useState<'flashcard' | 'quiz'>('flashcard')
    const [currentWordIndex, setCurrentWordIndex] = useState(0)
    const [showAnswer, setShowAnswer] = useState(false)
    const [score, setScore] = useState(0)
    const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({})

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            fetchVocabulary()
        }
    }, [user])

    const fetchVocabulary = async () => {
        try {
            setVocabularyLoading(true)
            const response = await fetch('/api/questions?type=vocabulary')
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch vocabulary')
            }

            if (result.data && result.data.length > 0) {
                // Group vocabulary by topics if available
                const groupedTopics = groupVocabularyByTopic(result.data)
                setVocabularyTopics(groupedTopics)
            } else {
                setVocabularyTopics([])
            }
        } catch (error) {
            setVocabularyError(error instanceof Error ? error.message : 'Unknown error')
            console.error('Error fetching vocabulary:', error)
        } finally {
            setVocabularyLoading(false)
        }
    }

    const groupVocabularyByTopic = (vocabulary: any[]) => {
        // Simple grouping by topic field or create a default topic
        const topics: any = {}

        vocabulary.forEach(word => {
            const topicId = word.topic || 'general'
            const topicTitle = word.topicTitle || 'General Vocabulary'

            if (!topics[topicId]) {
                topics[topicId] = {
                    id: topicId,
                    title: topicTitle,
                    description: word.topicDescription || 'Tổng hợp từ vựng TOEIC',
                    wordCount: 0,
                    color: getTopicColor(topicId),
                    words: []
                }
            }

            topics[topicId].words.push(word)
            topics[topicId].wordCount = topics[topicId].words.length
        })

        return Object.values(topics)
    }

    const getTopicColor = (topicId: string) => {
        const colors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 'bg-red-500']
        const index = topicId.charCodeAt(0) % colors.length
        return colors[index]
    }

    const getCurrentTopic = () => {
        return vocabularyTopics.find(topic => topic.id === selectedTopic)
    }

    const getCurrentWord = () => {
        const topic = getCurrentTopic()
        return topic?.words[currentWordIndex]
    }

    const handleNextWord = () => {
        const topic = getCurrentTopic()
        if (topic && currentWordIndex < topic.words.length - 1) {
            setCurrentWordIndex(currentWordIndex + 1)
            setShowAnswer(false)
        }
    }

    const handlePrevWord = () => {
        if (currentWordIndex > 0) {
            setCurrentWordIndex(currentWordIndex - 1)
            setShowAnswer(false)
        }
    }

    if (loading || vocabularyLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600"></div>
                <p className="ml-4 text-gray-600">
                    {loading ? 'Đang xác thực...' : 'Đang tải từ vựng từ database...'}
                </p>
            </div>
        )
    }

    if (!user) return null

    if (vocabularyError) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-red-600 text-xl mb-4">Lỗi tải dữ liệu</div>
                    <p className="text-gray-600 mb-4">{vocabularyError}</p>
                    <button
                        onClick={fetchVocabulary}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Thử lại
                    </button>
                </div>
            </div>
        )
    }

    if (vocabularyTopics.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-xl mb-4">Không có từ vựng</div>
                    <p className="text-gray-500 mb-4">Database chưa có dữ liệu từ vựng</p>
                    <button
                        onClick={() => window.location.href = '/dashboard'}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        ← Quay lại Dashboard
                    </button>
                </div>
            </div>
        )
    }

    // Show topic selection if no topic selected
    if (!selectedTopic) {
        return (
            <div className="min-h-screen bg-gray-50">
                <header className="bg-white shadow">
                    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-500 mr-4">
                                    ← Quay lại
                                </Link>
                                <h1 className="text-3xl font-bold text-gray-900">Luyện từ vựng TOEIC</h1>
                            </div>
                        </div>
                    </div>
                </header>

                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="px-4 py-6 sm:px-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {vocabularyTopics.map((topic) => (
                                <div key={topic.id} className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow cursor-pointer"
                                    onClick={() => setSelectedTopic(topic.id)}>
                                    <div className="p-6">
                                        <div className="flex items-center">
                                            <div className={`flex-shrink-0 w-8 h-8 ${topic.color} rounded-full flex items-center justify-center`}>
                                                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                                                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                            </div>
                                            <div className="ml-4">
                                                <h3 className="text-lg font-medium text-gray-900">{topic.title}</h3>
                                                <p className="text-sm text-gray-500">{topic.description}</p>
                                            </div>
                                        </div>
                                        <div className="mt-4">
                                            <p className="text-2xl font-bold text-gray-900">{topic.wordCount}</p>
                                            <p className="text-sm text-gray-500">từ vựng</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </main>
            </div>
        )
    }

    // Show flashcard mode
    const currentTopic = getCurrentTopic()
    const currentWord = getCurrentWord()

    if (!currentTopic || !currentWord) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="text-gray-600 text-xl mb-4">Chủ đề không tìm thấy</div>
                    <button
                        onClick={() => setSelectedTopic(null)}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700"
                    >
                        Quay lại danh sách chủ đề
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <button
                                onClick={() => setSelectedTopic(null)}
                                className="text-indigo-600 hover:text-indigo-500 mr-4"
                            >
                                ← Quay lại
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900">{currentTopic.title}</h1>
                        </div>
                        <div className="text-sm text-gray-600">
                            {currentWordIndex + 1} / {currentTopic.words.length}
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
                            style={{ width: `${((currentWordIndex + 1) / currentTopic.words.length) * 100}%` }}
                        ></div>
                    </div>
                </div>
            </div>

            <main className="max-w-4xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {/* Flashcard */}
                    <div className="bg-white shadow rounded-lg p-8 mb-8">
                        <div className="text-center">
                            <h2 className="text-4xl font-bold text-gray-900 mb-4">{currentWord.word}</h2>
                            {currentWord.pronunciation && (
                                <p className="text-lg text-gray-600 mb-6">{currentWord.pronunciation}</p>
                            )}

                            {showAnswer ? (
                                <div className="space-y-4">
                                    <p className="text-2xl text-indigo-600 font-semibold">{currentWord.meaning}</p>
                                    {currentWord.example && (
                                        <div className="bg-gray-50 p-4 rounded-lg">
                                            <p className="text-gray-800 italic mb-2">{currentWord.example}</p>
                                            {currentWord.translation && (
                                                <p className="text-gray-600">{currentWord.translation}</p>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <button
                                    onClick={() => setShowAnswer(true)}
                                    className="bg-indigo-600 text-white px-8 py-3 rounded-lg hover:bg-indigo-700 text-lg"
                                >
                                    Hiện nghĩa
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className="flex justify-between">
                        <button
                            onClick={handlePrevWord}
                            disabled={currentWordIndex === 0}
                            className="flex items-center px-6 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ← Từ trước
                        </button>

                        <button
                            onClick={handleNextWord}
                            disabled={currentWordIndex === currentTopic.words.length - 1}
                            className="flex items-center px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Từ tiếp theo →
                        </button>
                    </div>
                </div>
            </main>
        </div>
    )
}