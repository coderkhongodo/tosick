import { NextRequest, NextResponse } from 'next/server'
import { MongoClient } from 'mongodb'

const uri = process.env.MONGODB_URI || ''
const client = new MongoClient(uri)

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { uid, studyTime, testCompleted } = body

        if (!uid) {
            return NextResponse.json({ error: 'UID is required' }, { status: 400 })
        }

        await client.connect()
        const db = client.db('toeX')
        const users = db.collection('users')

        const user = await users.findOne({ uid })
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 })
        }

        const today = new Date()
        today.setHours(0, 0, 0, 0)

        const lastStudyDate = user.studyStats?.lastStudyDate ? new Date(user.studyStats.lastStudyDate) : null
        lastStudyDate?.setHours(0, 0, 0, 0)

        let newStreak = user.studyStats?.streak || 0
        let streakStartDate = user.studyStats?.streakStartDate ? new Date(user.studyStats.streakStartDate) : null

        // Calculate streak
        if (lastStudyDate) {
            const daysDiff = Math.floor((today.getTime() - lastStudyDate.getTime()) / (1000 * 60 * 60 * 24))

            if (daysDiff === 0) {
                // Same day, keep streak
            } else if (daysDiff === 1) {
                // Consecutive day, increment streak
                newStreak += 1
            } else {
                // Streak broken, reset
                newStreak = 1
                streakStartDate = today
            }
        } else {
            // First study session
            newStreak = 1
            streakStartDate = today
        }

        const updateData: any = {
            'studyStats.totalStudyTime': (user.studyStats?.totalStudyTime || 0) + (studyTime || 0),
            'studyStats.streak': newStreak,
            'studyStats.lastStudyDate': today,
            'studyStats.streakStartDate': streakStartDate,
            updatedAt: new Date()
        }

        if (testCompleted) {
            updateData['studyStats.completedTests'] = (user.studyStats?.completedTests || 0) + 1
        }

        const updatedUser = await users.findOneAndUpdate(
            { uid },
            { $set: updateData },
            { returnDocument: 'after' }
        )

        return NextResponse.json({ user: updatedUser.value })
    } catch (error) {
        console.error('Error updating study stats:', error)
        return NextResponse.json({ error: 'Failed to update study stats' }, { status: 500 })
    } finally {
        await client.close()
    }
}
