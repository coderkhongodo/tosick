import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const client = new MongoClient(uri)

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const uid = searchParams.get('uid')

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 })
        }

        await client.connect()
        const db = client.db('toeX')
        const users = db.collection('users')

        const user = await users.findOne({ uid })

        return NextResponse.json({ user })
    } catch (error) {
        console.error('Error fetching user:', error)
        return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
    } finally {
        await client.close()
    }
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { uid, email, displayName, photoURL, providerData } = body

        if (!uid || !email) {
            return NextResponse.json({ error: 'UID and email are required' }, { status: 400 })
        }

        // Determine the provider (Google, Email, etc.)
        let provider = 'email'
        if (providerData && providerData.length > 0) {
            provider = providerData[0].providerId === 'google.com' ? 'google' : 'email'
        }

        await client.connect()
        const db = client.db('toeX')
        const users = db.collection('users')

        // Check if user already exists
        const existingUser = await users.findOne({ uid })

        if (existingUser) {
            // Update existing user and add login history
            const updatedUser = await users.findOneAndUpdate(
                { uid },
                {
                    $set: {
                        email,
                        displayName,
                        photoURL,
                        provider,
                        lastLoginAt: new Date(),
                        updatedAt: new Date()
                    },
                    $push: {
                        loginHistory: {
                            loginAt: new Date(),
                            provider,
                            ip: request.headers.get('x-forwarded-for') || 'unknown'
                        }
                    }
                } as any,
                { returnDocument: 'after' }
            )
            return NextResponse.json({ user: updatedUser.value })
        } else {
            // Create new user
            const newUser = {
                uid,
                email,
                displayName,
                photoURL,
                provider,
                role: email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
                studyStats: {
                    totalStudyTime: 0,
                    streak: 0,
                    completedTests: 0,
                    lastStudyDate: null,
                    streakStartDate: null
                },
                loginHistory: [{
                    loginAt: new Date(),
                    provider,
                    ip: request.headers.get('x-forwarded-for') || 'unknown'
                }],
                createdAt: new Date(),
                updatedAt: new Date(),
                lastLoginAt: new Date()
            }

            const result = await users.insertOne(newUser)
            const createdUser = await users.findOne({ _id: result.insertedId })

            return NextResponse.json({ user: createdUser })
        }
    } catch (error) {
        console.error('Error creating/updating user:', error)
        return NextResponse.json({ error: 'Failed to create/update user' }, { status: 500 })
    } finally {
        await client.close()
    }
}
