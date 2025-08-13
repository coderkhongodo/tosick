import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyD7Nm8u94fYZVJVsHjKvYJYBThJnncKs4U",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "toex-ef561.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "toex-ef561",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "toex-ef561.appspot.com",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "892038632924",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:892038632924:web:f5cf5662dda0fb7ca5eb19"
}

const app = initializeApp(firebaseConfig)
export const auth = getAuth(app)
export const db = getFirestore(app)
export default app
