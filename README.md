## Tic-Tac-Toe MERN Skeleton
A lightweight multiplayer Tic-Tac-Toe application built using the MERN stack (MongoDB, Express, React, Node.js) with Socket.IO enabling real-time gameplay.

Prerequisites
Node.js (version 14 or higher)

npm or yarn

# Initial Setup
Run the following commands in your terminal:

Backend:
npm init -y
npm install mongodb express cors dotenv

Optional backend packages:
express-session – server-side session management
connect-mongo – store sessions in MongoDB
socket.io – real-time server communication
socket.io-client – real-time client communication

Frontend:
npx create-react-app frontend

Optional frontend packages:
react – UI components
react-dom – rendering React in the browser
react-scripts – build and development tooling
react-router-dom – page navigation
bootstrap – styling and layout

If using React, add this to package.json under “scripts” to enable auto-run:
"start": "react-scripts start"

For a plain Node backend:
"start": "node index.js"

# Installation
Clone the repository:
git clone <repository-url>
cd MERN_Skeleton

Install backend dependencies:
cd backend
npm install

Install frontend dependencies:
cd frontend
npm install

# Running the Application
Start the backend server:
cd backend
npm start
The backend will run at http://localhost:5000

Start the frontend:
cd frontend
npm start
The frontend will open at http://localhost:3000

# How to Play
Enter your name and choose to create a new game or join an existing one.
Share the generated game ID with your opponent.
Take turns clicking on the board to place your X or O.
The game automatically detects wins and draws.

# API Endpoints
POST /api/games/create – Create a new game
POST /api/games/join – Join an existing game
POST /api/games/move – Make a move
GET /api/games/:gameId – Retrieve the current game state

## API Endpoints
`POST /api/games/create` - Create a new game
`POST /api/games/join` - Join an existing game
`POST /api/games/move` - Make a move
`GET /api/games/:gameId` - Get game state
