'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthContext'
import Link from 'next/link'

interface DatabaseData {
    database: string
    collections: string[]
    totalCollections: number
    data: Record<string, {
        totalDocuments: number
        sampleDocuments: any[]
        error?: string
    }>
}

export default function DatabasePage() {
    const { user, loading } = useAuth()
    const router = useRouter()
    const [data, setData] = useState<DatabaseData | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [selectedCollection, setSelectedCollection] = useState<string | null>(null)
    const [customQuery, setCustomQuery] = useState('{}')
    const [queryResult, setQueryResult] = useState<any>(null)

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login')
        }
    }, [user, loading, router])

    useEffect(() => {
        if (user) {
            fetchDatabaseData()
        }
    }, [user])

    const fetchDatabaseData = async () => {
        setIsLoading(true)
        setError(null)

        try {
            const response = await fetch('/api/data')
            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Failed to fetch data')
            }

            setData(result)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error')
        } finally {
            setIsLoading(false)
        }
    }

    const executeCustomQuery = async () => {
        if (!selectedCollection) {
            alert('Please select a collection first')
            return
        }

        try {
            const query = JSON.parse(customQuery)
            const response = await fetch('/api/data', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    collection: selectedCollection,
                    query,
                    limit: 50
                })
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Query failed')
            }

            setQueryResult(result)
        } catch (err) {
            alert(`Query error: ${err instanceof Error ? err.message : 'Unknown error'}`)
        }
    }

    const seedDatabase = async () => {
        if (!confirm('This will add sample data to your database. Continue?')) {
            return
        }

        try {
            const response = await fetch('/api/seed', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                }
            })

            const result = await response.json()

            if (!response.ok) {
                throw new Error(result.error || 'Seed failed')
            }

            alert(`Success! Inserted: ${JSON.stringify(result.inserted, null, 2)}`)
            fetchDatabaseData() // Refresh data
        } catch (err) {
            alert(`Seed error: ${err instanceof Error ? err.message : 'Unknown error'}`)
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

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center py-6">
                        <div className="flex items-center space-x-4">
                            <Link href="/dashboard" className="text-indigo-600 hover:text-indigo-800">
                                ← Quay lại Dashboard
                            </Link>
                            <h1 className="text-2xl font-bold text-gray-900">MongoDB Database: toeX</h1>
                        </div>
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={fetchDatabaseData}
                                disabled={isLoading}
                                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                {isLoading ? 'Loading...' : 'Refresh'}
                            </button>
                            <p className="text-sm text-gray-600">
                                Database hiện đang sử dụng dữ liệu thật từ MongoDB Atlas
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <h3 className="text-sm font-medium text-red-800">Connection Error</h3>
                                    <div className="mt-2 text-sm text-red-700">
                                        <p>{error}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {isLoading && (
                        <div className="text-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                            <p className="mt-4 text-gray-600">Connecting to MongoDB...</p>
                        </div>
                    )}

                    {data && (
                        <>
                            {/* Database Overview */}
                            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Database Overview</h2>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        <div className="bg-blue-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-blue-900">Database Name</h3>
                                            <p className="text-2xl font-bold text-blue-600">{data.database}</p>
                                        </div>
                                        <div className="bg-green-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-green-900">Total Collections</h3>
                                            <p className="text-2xl font-bold text-green-600">{data.totalCollections}</p>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg">
                                            <h3 className="text-sm font-medium text-purple-900">Status</h3>
                                            <p className="text-2xl font-bold text-purple-600">Connected</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Collections List */}
                            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Collections</h2>
                                    {data.collections.length === 0 ? (
                                        <p className="text-gray-500 text-center py-8">No collections found in database</p>
                                    ) : (
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {data.collections.map((collection) => {
                                                const collectionData = data.data[collection]
                                                return (
                                                    <div
                                                        key={collection}
                                                        className={`border rounded-lg p-4 cursor-pointer transition ${selectedCollection === collection
                                                            ? 'border-indigo-500 bg-indigo-50'
                                                            : 'border-gray-200 hover:border-gray-300'
                                                            }`}
                                                        onClick={() => setSelectedCollection(collection)}
                                                    >
                                                        <h3 className="font-semibold text-gray-900">{collection}</h3>
                                                        {collectionData.error ? (
                                                            <p className="text-red-500 text-sm mt-1">{collectionData.error}</p>
                                                        ) : (
                                                            <p className="text-gray-600 text-sm mt-1">
                                                                {collectionData.totalDocuments} documents
                                                            </p>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Custom Query */}
                            <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                                <div className="px-4 py-5 sm:p-6">
                                    <h2 className="text-lg font-medium text-gray-900 mb-4">Custom Query</h2>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Selected Collection: {selectedCollection || 'None'}
                                            </label>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                MongoDB Query (JSON):
                                            </label>
                                            <textarea
                                                value={customQuery}
                                                onChange={(e) => setCustomQuery(e.target.value)}
                                                className="w-full h-24 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                placeholder='{"field": "value"}'
                                            />
                                        </div>
                                        <button
                                            onClick={executeCustomQuery}
                                            disabled={!selectedCollection}
                                            className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            Execute Query
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Query Results */}
                            {queryResult && (
                                <div className="bg-white overflow-hidden shadow rounded-lg mb-6">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4">Query Results</h2>
                                        <div className="mb-4">
                                            <p className="text-sm text-gray-600">
                                                Collection: <strong>{queryResult.collection}</strong> |
                                                Total: <strong>{queryResult.totalDocuments}</strong> documents |
                                                Showing: <strong>{queryResult.documents.length}</strong> results
                                            </p>
                                        </div>
                                        <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-auto">
                                            <pre className="text-sm text-gray-800">
                                                {JSON.stringify(queryResult.documents, null, 2)}
                                            </pre>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Sample Data from Collections */}
                            {Object.entries(data.data).map(([collection, collectionData]) => (
                                <div key={collection} className="bg-white overflow-hidden shadow rounded-lg mb-6">
                                    <div className="px-4 py-5 sm:p-6">
                                        <h2 className="text-lg font-medium text-gray-900 mb-4">
                                            Collection: {collection}
                                        </h2>
                                        {collectionData.error ? (
                                            <p className="text-red-500">{collectionData.error}</p>
                                        ) : (
                                            <>
                                                <div className="mb-4">
                                                    <p className="text-sm text-gray-600">
                                                        Total documents: <strong>{collectionData.totalDocuments}</strong>
                                                    </p>
                                                </div>
                                                {collectionData.sampleDocuments.length === 0 ? (
                                                    <p className="text-gray-500 text-center py-4">No documents found</p>
                                                ) : (
                                                    <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-auto">
                                                        <pre className="text-sm text-gray-800">
                                                            {JSON.stringify(collectionData.sampleDocuments, null, 2)}
                                                        </pre>
                                                    </div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </>
                    )}
                </div>
            </main>
        </div>
    )
}
