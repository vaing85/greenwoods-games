// MongoDB initialization script for Greenwood Games
db = db.getSiblingDB('greenwood_games');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['username', 'email', 'passwordHash'],
      properties: {
        username: { bsonType: 'string', minLength: 3, maxLength: 20 },
        email: { bsonType: 'string', pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$' },
        passwordHash: { bsonType: 'string' },
        balance: { bsonType: 'number', minimum: 0 },
        createdAt: { bsonType: 'date' },
        lastLogin: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('transactions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'type', 'amount', 'timestamp'],
      properties: {
        userId: { bsonType: 'objectId' },
        type: { enum: ['deposit', 'withdrawal', 'bet', 'win', 'bonus'] },
        amount: { bsonType: 'number' },
        gameType: { bsonType: 'string' },
        description: { bsonType: 'string' },
        timestamp: { bsonType: 'date' }
      }
    }
  }
});

db.createCollection('gamesessions', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['userId', 'gameType', 'startTime'],
      properties: {
        userId: { bsonType: 'objectId' },
        gameType: { bsonType: 'string' },
        startTime: { bsonType: 'date' },
        endTime: { bsonType: 'date' },
        totalBet: { bsonType: 'number', minimum: 0 },
        totalWin: { bsonType: 'number', minimum: 0 },
        gameData: { bsonType: 'object' }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ username: 1 }, { unique: true });
db.users.createIndex({ email: 1 }, { unique: true });
db.transactions.createIndex({ userId: 1, timestamp: -1 });
db.transactions.createIndex({ timestamp: -1 });
db.gamesessions.createIndex({ userId: 1, startTime: -1 });
db.gamesessions.createIndex({ gameType: 1, startTime: -1 });

print('Greenwood Games database initialized successfully!');
