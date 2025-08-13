import { MongoClient, Db } from 'mongodb'

const uri = process.env.MONGODB_URI || 'mongodb+srv://huynhlytankhoa:JqibF9fS0HAnanR8@cluster0.rdtkle7.mongodb.net/'
const dbName = 'toeX'

// Connection options for better performance
const options = {
    maxPoolSize: 10, // Maintain up to 10 socket connections
    serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
    socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
    connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
    family: 4, // Use IPv4, skip trying IPv6
}

let client: MongoClient | null = null
let db: Db | null = null

// Connection caching for Next.js
declare global {
    var _mongoClientPromise: Promise<MongoClient> | undefined
}

export async function connectToDatabase() {
    try {
        if (client && db) {
            return { client, db }
        }

        if (process.env.NODE_ENV === 'development') {
            // In development mode, use a global variable so the connection is cached across module reloads
            if (!global._mongoClientPromise) {
                client = new MongoClient(uri, options)
                global._mongoClientPromise = client.connect()
            }
            client = await global._mongoClientPromise
        } else {
            // In production mode, it's best to not use a global variable
            client = new MongoClient(uri, options)
            await client.connect()
        }

        db = client.db(dbName)
        console.log('Connected to MongoDB')
        return { client, db }
    } catch (error) {
        console.error('MongoDB connection error:', error)
        throw error
    }
}

export async function getDatabase(): Promise<Db> {
    if (db) {
        return db
    }

    const { db: database } = await connectToDatabase()
    return database
}
