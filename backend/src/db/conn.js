const { MongoClient, ServerApiVersion } = require('mongodb');

//Database URI from config.env
const uri = process.env.ATLAS_URI;

//Variable for database instance
let _db;

//Fallback storage method when MongoDB is not available
let inMemoryStorage = { games: new Map() };

//Connects to MongoDB
const connectToServer = async (callback) => {
  // If no URI is provided, use in-memory fallback
  if (!uri) {
    console.log('No MongoDB URI provided, using in-memory storage for demonstration');
    _db = {
      collection: (name) => ({
        insertOne: async (doc) => {
          const id = doc._id;
          inMemoryStorage.games.set(id, { ...doc });
          return { acknowledged: true };
        },
        findOne: async (query) => {
          return inMemoryStorage.games.get(query._id) || null;
        },
        updateOne: async (query, update) => {
          const game = inMemoryStorage.games.get(query._id);
          if (game) {
            Object.assign(game, update.$set);
            return { acknowledged: true };
          }
          return { acknowledged: false };
        },
        find: (query) => ({
          sort: () => ({
            toArray: async () => {
              const games = Array.from(inMemoryStorage.games.values());
              return query.completed ? games.filter(g => g.completed) : games;
            }
          })
        }),
        deleteMany: async () => {
          inMemoryStorage.games.clear();
          return { acknowledged: true };
        }
      })
    };
    if (callback) callback();
    return;
  }

  //Creates MongoDB client
  const client = new MongoClient(uri, {
    serverApi: {
      version: ServerApiVersion.v1,
      strict: true,
      deprecationErrors: true,
    }
  });

  try {
    //Attempt to connect to MongoDB
    await client.connect();
    //Ping the admin database to verify connection
    await client.db('admin').command({ ping: 1 });
    //Set the database instance
    _db = client.db('test');
    console.log('Connected to Tic-Tac-Toe Database');
    if (callback) callback();
  } catch (err) {
    console.error('Database connection failed:', err);
    if (callback) callback(err);
  }
};

//Returns the database instance
const getDb = () => {
  if (!_db) throw new Error('Database not initialized');
  return _db;
};

module.exports = { connectToServer, getDb };