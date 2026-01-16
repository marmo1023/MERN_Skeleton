# Tic-Tac-Toe MERN Skeleton

A simple multiplayer Tic-Tac-Toe game built with the MERN stack (MongoDB, Express, React, Node.js) and Socket.IO for real-time updates

## Prerequisites
- Node.js (v14 or higher)
- npm or yarn

## Installation
Clone the repository:
   git clone <repository-url>
   cd MERN_Skeleton

Install backend dependencies:
   cd backend
   npm install

Install frontend dependencies:
   cd frontend
   npm install

## Running the Application
Start the backend server:
   cd backend
   npm start

   The server will run on http://localhost:5000

Start the frontend:
   cd frontend
   npm start

   The app will open in your browser at http://localhost:3000

## How to Play
1. Enter your name and choose to create a new game or join an existing one.
2. Share the game ID with your opponent to join.
3. Take turns clicking on the board to place your X or O.
4. The game detects wins and draws automatically.

## API Endpoints
`POST /api/games/create` - Create a new game
`POST /api/games/join` - Join an existing game
`POST /api/games/move` - Make a move
`GET /api/games/:gameId` - Get game state