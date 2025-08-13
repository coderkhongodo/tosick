import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

export async function GET(request: NextRequest) {
    try {
        console.log('🔄 Testing MongoDB connection...')
        console.log('📋 MONGODB_URI:', process.env.MONGODB_URI ? 'Found' : 'Missing')

        const uri = process.env.MONGODB_URI || ''
        if (!uri) {
            return NextResponse.json({
                error: 'MONGODB_URI not found in environment variables',
                status: 'failed'
            }, { status: 500 })
        }

        console.log('🔗 URI format:', uri.substring(0, 20) + '...')

        const client = new MongoClient(uri)
        await client.connect()
        console.log('✅ MongoDB connected successfully!')

        const db = client.db('toeX')
        console.log('📂 Database "toeX" accessed')

        // Test collections access
        const collections = await db.listCollections().toArray()
        console.log('📋 Collections found:', collections.map(c => c.name))

        // Test users collection
        const users = db.collection('users')
        const userCount = await users.countDocuments()
        console.log('👥 Users count:', userCount)

        await client.close()
        console.log('🔒 Connection closed')

        return NextResponse.json({
            status: 'success',
            message: 'MongoDB connection successful',
            database: 'toeX',
            collections: collections.map(c => c.name),
            usersCount: userCount
        })

    } catch (error) {
        console.error('❌ MongoDB connection error:', error)
        return NextResponse.json({
            status: 'failed',
            error: error instanceof Error ? error.message : 'Unknown error',
            details: process.env.NODE_ENV === 'development' ? error : undefined
        }, { status: 500 })
    }
}
