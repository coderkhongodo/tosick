'use client'

export class SessionTracker {
    private startTime: number = 0
    private totalTime: number = 0
    private isActive: boolean = false
    private userId: string | null = null
    private intervalId: NodeJS.Timeout | null = null
    private lastActivityTime: number = 0
    private readonly INACTIVITY_THRESHOLD = 5 * 60 * 1000 // 5 minutes
    private readonly SYNC_INTERVAL = 30 * 1000 // 30 seconds

    constructor() {
        if (typeof window !== 'undefined') {
            this.setupActivityListeners()
        }
    }

    startSession(userId: string) {
        this.userId = userId
        this.startTime = Date.now()
        this.lastActivityTime = Date.now()
        this.isActive = true

        console.log('📊 Session started for user:', userId)

        // Start periodic sync
        this.intervalId = setInterval(() => {
            this.checkActivityAndSync()
        }, this.SYNC_INTERVAL)

        // Initial activity
        this.updateActivity()
    }

    endSession() {
        if (this.isActive && this.userId) {
            this.syncTimeToServer()
        }

        this.isActive = false
        this.userId = null

        if (this.intervalId) {
            clearInterval(this.intervalId)
            this.intervalId = null
        }

        console.log('📊 Session ended')
    }

    private setupActivityListeners() {
        // Track user activity
        const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click']

        events.forEach(event => {
            document.addEventListener(event, () => {
                this.updateActivity()
            }, true)
        })

        // Handle page visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.handleInactive()
            } else {
                this.handleActive()
            }
        })

        // Handle page unload
        window.addEventListener('beforeunload', () => {
            this.endSession()
        })
    }

    private updateActivity() {
        this.lastActivityTime = Date.now()
    }

    private handleActive() {
        if (!this.isActive && this.userId) {
            this.startTime = Date.now()
            this.isActive = true
            console.log('📊 User became active')
        }
    }

    private handleInactive() {
        if (this.isActive) {
            this.syncTimeToServer()
        }
        console.log('📊 User became inactive')
    }

    private checkActivityAndSync() {
        const now = Date.now()
        const timeSinceLastActivity = now - this.lastActivityTime

        if (timeSinceLastActivity > this.INACTIVITY_THRESHOLD) {
            // User has been inactive, stop counting
            if (this.isActive) {
                this.syncTimeToServer()
                this.isActive = false
                console.log('📊 User inactive for too long, stopping session')
            }
        } else if (this.isActive) {
            // User is active, sync time periodically
            this.syncTimeToServer()
        }
    }

    private async syncTimeToServer() {
        if (!this.userId || !this.startTime) return

        const sessionTime = Math.floor((Date.now() - this.startTime) / 1000 / 60) // Convert to minutes

        if (sessionTime < 1) return // Don't sync if less than 1 minute

        try {
            console.log(`📊 Syncing ${sessionTime} minutes to server`)

            const response = await fetch('/api/user/session-time', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: this.userId,
                    sessionTime,
                    timestamp: new Date().toISOString()
                }),
            })

            if (response.ok) {
                console.log('✅ Session time synced successfully')
                // Reset start time for next period
                this.startTime = Date.now()
            } else {
                console.error('❌ Failed to sync session time')
            }
        } catch (error) {
            console.error('❌ Error syncing session time:', error)
        }
    }

    // Get current session time in minutes
    getCurrentSessionTime(): number {
        if (!this.isActive || !this.startTime) return 0
        return Math.floor((Date.now() - this.startTime) / 1000 / 60)
    }
}

// Singleton instance
export const sessionTracker = new SessionTracker()
