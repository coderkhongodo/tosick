import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function GET(request: NextRequest) {
    try {
        const db = await getDatabase()

        // Lấy danh sách tất cả collections
        const collections = await db.listCollections().toArray()
        const collectionNames = collections.map(col => col.name)

        let data: any = {
            database: 'toeX',
            collections: collectionNames,
            totalCollections: collectionNames.length,
            data: {}
        }

        // Đọc dữ liệu từ từng collection
        for (const collectionName of collectionNames) {
            try {
                const collection = db.collection(collectionName)
                const documents = await collection.find({}).limit(10).toArray() // Giới hạn 10 documents
                const count = await collection.countDocuments()

                data.data[collectionName] = {
                    totalDocuments: count,
                    sampleDocuments: documents
                }
            } catch (error) {
                console.error(`Error reading collection ${collectionName}:`, error)
                data.data[collectionName] = {
                    error: 'Failed to read collection'
                }
            }
        }

        return NextResponse.json(data)
    } catch (error) {
        console.error('Database connection error:', error)
        return NextResponse.json(
            {
                error: 'Failed to connect to database',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { collection: collectionName, query = {}, limit = 10 } = body

        if (!collectionName) {
            return NextResponse.json(
                { error: 'Collection name is required' },
                { status: 400 }
            )
        }

        const db = await getDatabase()
        const collection = db.collection(collectionName)

        const documents = await collection.find(query).limit(limit).toArray()
        const count = await collection.countDocuments(query)

        return NextResponse.json({
            collection: collectionName,
            query,
            totalDocuments: count,
            documents
        })
    } catch (error) {
        console.error('Database query error:', error)
        return NextResponse.json(
            {
                error: 'Failed to query database',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}
