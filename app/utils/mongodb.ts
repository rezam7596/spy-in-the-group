import {Db, MongoClient} from 'mongodb';
import {attachDatabasePool} from '@vercel/functions';

let client: MongoClient | null = null;
let db: Db | null = null;

export async function connectToDatabase(): Promise<Db> {
  // Return existing connection if available
  if (db) {
    return db;
  }

  const uri = process.env.MONGODB_URI;
  if (!uri) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    // Create MongoDB client
    client = new MongoClient(uri);

    // Attach the client to ensure proper cleanup on function suspension
    attachDatabasePool(client);

    await client.connect();

    // Get database
    db = client.db();

    console.log('✅ Connected to MongoDB');

    // Create indexes
    await createIndexes(db);


    return db;
  } catch (error) {
    console.error('❌ Failed to connect to MongoDB:', error);
    throw error;
  }
}

async function createIndexes(database: Db) {
  const roomsCollection = database.collection('rooms');

  try {
    // Create unique index on room ID
    await roomsCollection.createIndex({id: 1}, {unique: true});

    // Create TTL index for automatic cleanup (2 hours)
    await roomsCollection.createIndex(
      {createdAt: 1},
      {expireAfterSeconds: 7200}
    );

    // Create index on hostId for efficient queries
    await roomsCollection.createIndex({hostId: 1});

    console.log('✅ MongoDB indexes created');
  } catch (error) {
    console.error('⚠️  Warning: Failed to create indexes:', error);
    // Don't throw - indexes might already exist
  }
}

// Graceful shutdown
export async function disconnectFromDatabase() {
  if (client) {
    await client.close();
    client = null;
    db = null;
    console.log('✅ Disconnected from MongoDB');
  }
}
