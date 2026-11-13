// Connects to MongoDB.
// - If MONGO_URI is set in .env, we connect to that database (local MongoDB or Atlas).
// - If MONGO_URI is empty, we start a built-in MongoDB server automatically,
//   so the project runs without installing MongoDB. Its data is saved in server/data/db.
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

let embeddedServer = null; // the built-in MongoDB server, if we started one

const startEmbeddedMongo = async () => {
  // Loaded only when needed, so normal MONGO_URI users never touch it
  const { MongoMemoryServer } = require('mongodb-memory-server-core');

  const dbPath = path.join(__dirname, '..', 'data', 'db');
  fs.mkdirSync(dbPath, { recursive: true });

  embeddedServer = await MongoMemoryServer.create({
    // wiredTiger + dbPath = data is written to disk and kept after a restart
    instance: { dbPath, storageEngine: 'wiredTiger', dbName: 'lostfound' },
  });
  console.log('Started built-in MongoDB (data folder: server/data/db)');
  return embeddedServer.getUri('lostfound');
};

const connectDB = async () => {
  try {
    const uri = process.env.MONGO_URI || (await startEmbeddedMongo());
    // The built-in server is stopped abruptly (Ctrl+C, nodemon restart), so ask it to
    // write every change to its on-disk journal before confirming it ("j: true").
    const options = embeddedServer ? { writeConcern: { w: 1, j: true } } : {};
    const conn = await mongoose.connect(uri, options);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    process.exit(1); // stop the app, there is no point running without a database
  }
};

// Close the connection (and the built-in server if we started it). Used by seed.js.
const disconnectDB = async () => {
  await mongoose.disconnect();
  if (embeddedServer) await embeddedServer.stop({ doCleanup: false }); // keep the data files
};

module.exports = connectDB;
module.exports.disconnectDB = disconnectDB;
