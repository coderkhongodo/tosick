import { NextRequest, NextResponse } from 'next/server'
import { getDatabase } from '@/lib/mongodb'

export async function POST(request: NextRequest) {
    try {
        const db = await getDatabase()

        // Get data from request body
        const body = await request.json()
        const { collection, data } = body

        if (!collection || !data) {
            return NextResponse.json(
                { error: 'Collection name and data are required' },
                { status: 400 }
            )
        }

        const targetCollection = db.collection(collection)
        let result

        if (Array.isArray(data)) {
            result = await targetCollection.insertMany(data.map(item => ({
                ...item,
                createdAt: new Date(),
                updatedAt: new Date()
            })))
        } else {
            result = await targetCollection.insertOne({
                ...data,
                createdAt: new Date(),
                updatedAt: new Date()
            })
        }

        return NextResponse.json({
            success: true,
            collection,
            inserted: Array.isArray(data) ? result.insertedCount : 1,
            ids: Array.isArray(data) ? result.insertedIds : result.insertedId
        })

    } catch (error) {
        console.error('Seed error:', error)
        return NextResponse.json(
            {
                error: 'Failed to seed data',
                message: error instanceof Error ? error.message : 'Unknown error'
            },
            { status: 500 }
        )
    }
}