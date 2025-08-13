'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth'
import { auth } from '@/lib/firebase'
import { User as AppUser } from '@/types/user'
import { sessionTracker } from '@/lib/sessionTracker'

interface AuthContextType {
    user: FirebaseUser | null
    appUser: AppUser | null
    loading: boolean
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    appUser: null,
    loading: true,
})

export const useAuth = () => {
    return useContext(AuthContext)
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<FirebaseUser | null>(null)
    const [appUser, setAppUser] = useState<AppUser | null>(null)
    const [loading, setLoading] = useState(true)

    const syncUserWithMongoDB = async (firebaseUser: FirebaseUser) => {
        try {
            console.log('🔄 Syncing user with MongoDB...', {
                uid: firebaseUser.uid,
                email: firebaseUser.email,
                displayName: firebaseUser.displayName
            })

            const response = await fetch('/api/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    uid: firebaseUser.uid,
                    email: firebaseUser.email,
                    displayName: firebaseUser.displayName,
                    photoURL: firebaseUser.photoURL,
                    providerData: firebaseUser.providerData,
                }),
            })

            console.log('📡 API Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('✅ User synced successfully:', data.user?.email)
                setAppUser(data.user)
            } else {
                const errorData = await response.json()
                console.error('❌ API Error:', errorData)
            }
        } catch (error) {
            console.error('❌ Error syncing user with MongoDB:', error)
        }
    }

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            setUser(user)

            if (user) {
                await syncUserWithMongoDB(user)
                // Start session tracking
                sessionTracker.startSession(user.uid)
                console.log('📊 Started session tracking for user:', user.uid)
            } else {
                setAppUser(null)
                // End session tracking
                sessionTracker.endSession()
                console.log('📊 Ended session tracking')
            }

            setLoading(false)
        })

        // Cleanup on unmount
        return () => {
            unsubscribe()
            sessionTracker.endSession()
        }
    }, [])

    const value = {
        user,
        appUser,
        loading,
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}
