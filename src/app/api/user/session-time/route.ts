import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const client = new MongoClient(uri)

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const { uid, sessionTime, timestamp } = body

        if (!uid || !sessionTime || sessionTime < 1) {
            return NextResponse.json({ error: 'Invalid session data' }, { status: 400 })
        }

        await client.connect()
        const db = client.db('toeX')
        const users = db.collection('users')

        const user = await users.findOne({ uid })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const now = new Date()
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        const lastStudyDate = user.studyStats?.lastStudyDate ? new Date(user.studyStats.lastStudyDate) : null
        const lastStudyDateOnly = lastStudyDate ? new Date(lastStudyDate.getFullYear(), lastStudyDate.getMonth(), lastStudyDate.getDate()) : null

        // Calculate streak
        let newStreak = user.studyStats?.streak || 0
        let streakStartDate = user.studyStats?.streakStartDate ? new Date(user.studyStats.streakStartDate) : null

        if (!lastStudyDateOnly) {
            // First time studying
            newStreak = 1
            streakStartDate = today
        } else {
            const daysDiff = Math.floor((today.getTime() - lastStudyDateOnly.getTime()) / (1000 * 60 * 60 * 24))

            if (daysDiff === 0) {
                // Same day, keep streak
                newStreak = user.studyStats.streak || 1
            } else if (daysDiff === 1) {
                // Next day, increment streak
                newStreak = (user.studyStats.streak || 0) + 1
            } else if (daysDiff > 1) {
                // Missed days, reset streak
                newStreak = 1
                streakStartDate = today
                console.log(`🔥 Streak reset for user ${uid}. Days missed: ${daysDiff}`)
            }
        }

        // Update user stats
        const updatedUser = await users.findOneAndUpdate(
            { uid },
            {
                $inc: {
                    'studyStats.totalStudyTime': sessionTime
                },
                $set: {
                    'studyStats.lastStudyDate': now,
                    'studyStats.streak': newStreak,
                    'studyStats.streakStartDate': streakStartDate,
                    'updatedAt': now
                },
                $push: {
                    'studyStats.sessions': {
                        date: now,
                        duration: sessionTime, // in minutes
                        timestamp: timestamp
                    }
                }
            },
            { returnDocument: 'after' }
        )

        console.log(`📊 Updated stats for ${uid}: +${sessionTime}min, streak: ${newStreak}`)

        return NextResponse.json({
            message: 'Session time updated successfully',
            stats: {
                totalStudyTime: updatedUser.value?.studyStats?.totalStudyTime,
                streak: newStreak,
                sessionTime: sessionTime
            }
        })

    } catch (error) {
        console.error('Error updating session time:', error)
        return NextResponse.json({ error: 'Failed to update session time' }, { status: 500 })
    } finally {
        await client.close()
    }
}

// API to check and update streaks (daily cron job simulation)
export async function PUT(request: NextRequest) {
    try {
        await client.connect()
        const db = client.db('toeX')
        const users = db.collection('users')

        const yesterday = new Date()
        yesterday.setDate(yesterday.getDate() - 1)
        yesterday.setHours(23, 59, 59, 999) // End of yesterday

        // Find users who didn't study yesterday and have active streaks
        const usersToUpdate = await users.find({
            'studyStats.streak': { $gt: 0 },
            $or: [
                { 'studyStats.lastStudyDate': { $lt: yesterday } },
                { 'studyStats.lastStudyDate': null }
            ]
        }).toArray()

        let updatedCount = 0

        for (const user of usersToUpdate) {
            const lastStudyDate = user.studyStats?.lastStudyDate ? new Date(user.studyStats.lastStudyDate) : null
            const today = new Date()

            if (lastStudyDate) {
                const daysDiff = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))

                if (daysDiff > 1) {
                    // Reset streak
                    await users.updateOne(
                        { uid: user.uid },
                        {
                            $set: {
                                'studyStats.streak': 0,
                                'studyStats.streakStartDate': null,
                                'updatedAt': new Date()
                            }
                        }
                    )
                    updatedCount++
                    console.log(`🔥 Streak reset for user ${user.uid} (${user.email}). Days missed: ${daysDiff}`)
                }
            }
        }

        return NextResponse.json({
            message: `Streak check completed. ${updatedCount} users had their streaks reset.`,
            updatedUsers: updatedCount
        })

    } catch (error) {
        console.error('Error checking streaks:', error)
        return NextResponse.json({ error: 'Failed to check streaks' }, { status: 500 })
    } finally {
        await client.close()
    }
}
