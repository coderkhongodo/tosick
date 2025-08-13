import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const part = searchParams.get('part')
        const type = searchParams.get('type')
        const testSet = searchParams.get('testSet') // For test sets (1, 2, 3...)
        const limit = parseInt(searchParams.get('limit') || '1000')

        const db = await getDatabase()

        let query: any = {}
        let collectionName = 'questions'

        // Use specific collections for each part
        if (part && type) {
            const partNum = parseInt(part)

            // New collection structure: part5Questions, part6Questions, part7Questions
            if (type === 'readingQuestions' || type === 'reading') {
                collectionName = `part${partNum}Questions`
            } else if (type === 'listeningQuestions' || type === 'listening') {
                collectionName = `listeningPart${partNum}Questions`
            }
        } else if (type === 'readingQuestions') {
            collectionName = 'readingQuestions'
        } else if (type === 'listeningQuestions') {
            collectionName = 'listeningQuestions'
        }

        console.log(`Using collection: ${collectionName} for part ${part}`)

        const collection = db.collection(collectionName)

        // For test sets (30 questions per set for Part 5, 16 for Part 6, 54 for Part 7)
        if (testSet && part) {
            const setNum = parseInt(testSet)
            const questionsPerSet = part === '5' ? 30 : part === '6' ? 16 : 54
            const skip = (setNum - 1) * questionsPerSet

            // Optimize: Run count and find in parallel
            const [questions, total] = await Promise.all([
                collection.find(query, {
                    projection: {
                        _id: 1,
                        id: 1,
                        part: 1,
                        question: 1,
                        choices: 1,
                        correctAnswer: 1,
                        explanation: 1,
                        grammarPoint: 1,
                        difficulty: 1,
                        passage: 1,
                        passageId: 1,
                        passageType: 1,
                        // Part 7 specific fields
                        passageContent: 1,
                        passageTitle: 1,
                        questions: 1
                    }
                })
                    .skip(skip)
                    .limit(questionsPerSet)
                    .toArray(),
                collection.estimatedDocumentCount() // Much faster than countDocuments for large collections
            ])

            const totalSets = Math.ceil(total / questionsPerSet)

            return NextResponse.json({
                success: true,
                data: questions,
                total: questions.length,
                testSet: setNum,
                totalSets,
                part: parseInt(part),
                collection: collectionName
            })
        }

        // Regular query - Optimize with projection and parallel execution
        const [questions, total] = await Promise.all([
            collection.find(query, {
                projection: {
                    _id: 1,
                    id: 1,
                    part: 1,
                    question: 1,
                    choices: 1,
                    correctAnswer: 1,
                    explanation: 1,
                    grammarPoint: 1,
                    difficulty: 1,
                    passage: 1,
                    passageId: 1,
                    passageType: 1,
                    // Part 7 specific fields
                    passageContent: 1,
                    passageTitle: 1,
                    questions: 1
                }
            }).limit(limit).toArray(),
            collection.estimatedDocumentCount()
        ])

        return NextResponse.json({
            success: true,
            data: questions,
            total,
            query,
            collection: collectionName
        })

    } catch (error) {
        console.error('Questions API error:', error)
        return NextResponse.json(
            {
                error: 'Failed to fetch questions',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { type, part, questions } = body

        if (!type || !questions || !Array.isArray(questions)) {
            return NextResponse.json(
                { error: 'Invalid request body. Required: type, questions (array)' },
                { status: 400 }
            )
        }

        const db = await getDatabase()

        // Determine collection name
        let collectionName = 'questions'
        if (type === 'reading') {
            collectionName = 'reading'
        } else if (type === 'listening') {
            collectionName = 'listening'
        }

        const collection = db.collection(collectionName)

        // Add metadata to each question
        const questionsWithMeta = questions.map(q => ({
            ...q,
            type,
            part: part || q.part,
            createdAt: new Date(),
            updatedAt: new Date()
        }))

        const result = await collection.insertMany(questionsWithMeta)

        return NextResponse.json({
            success: true,
            inserted: result.insertedCount,
            ids: result.insertedIds
        })

    } catch (error) {
        console.error('Questions POST error:', error)
        return NextResponse.json(
            {
                error: 'Failed to insert questions',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
