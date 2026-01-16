const express = require('express');                 //Web framework for Node.js
const session = require('express-session');         //Session management
const dotenv = require('dotenv');                   //Load environment variables
dotenv.config({ path: './src/config/config.env' }); //Load config from file
const http = require('http');                       //HTTP server
const { Server } = require('socket.io');            //Real-time communication
const { MongoStore } = require('connect-mongo');    //MongoDB session store
const cors = require('cors');                       //Cross-origin resource sharing
const dbo = require('./src/db/conn.js');            //Database connection

const app = express();                              //Initialize Express app
const port = process.env.PORT || 5000; //Port from env or default 5000
const server = http.createServer(app); //Create HTTP server

//Create Socket.IO server
const io = new Server(server, { cors: { origin: 'http://localhost:3000', credentials: true }});

//Middleware
app.use(express.json()); //Parse JSON bodies
app.use(cors({
  origin: 'http://localhost:3000', //Allow frontend
  credentials: true
}));

// Session configuration with MongoDB store or memory store fallback
if (process.env.ATLAS_URI) {
  // Use MongoDB session store when URI is available
  app.use(session({
    secret: process.env.SESSION_SECRET, // Secret for signing session ID
    resave: false, // Don't save session if unmodified
    saveUninitialized: false, // Don't create session until something stored
    store: new MongoStore({
      mongoUrl: process.env.ATLAS_URI, // MongoDB connection URL
      dbName: 'ticTacToe', // Database name
      collectionName: 'sessions' // Collection for sessions
    }),
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, //24 hours
      httpOnly: true, //Prevent client-side access
      sameSite: 'lax' //CSRF protection
    }
  }));
} else {
  //Use memory store for demo when MongoDB is not available
  console.log('Using memory session store for demonstration');
  app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24,
      httpOnly: true,
      sameSite: 'lax'
    }
  }));
}

// Connect to database before setting up routes
dbo.connectToServer((err) => {
  if (err) {
    console.error('Database connection failed:', err);
    process.exit(1); //Exit if DB connection fails
  }

  //Routes - only set up after DB connection
  app.use('/api/games', require('./routes/game.js')(dbo, io)); // Game routes

  //Socket.IO event handlers
  io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);

    //Handle joining a game room
    socket.on('joinGame', ({ gameId }) => {
      if (!gameId) return;
      const room = `game:${gameId}`;
      socket.join(room);
      io.to(room).emit('playerJoined', { socketId: socket.id, gameId });
    });

    //Handle client disconnect
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  });

  //Start the server
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});