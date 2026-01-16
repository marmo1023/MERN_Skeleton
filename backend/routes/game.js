const express = require('express');

module.exports = (dbInstance, io) => {
  //Create Express router
  const router = express.Router();

  //Get database collections
  const gamesCollection = dbInstance.getDb().collection('games');

  //Helper: gets room name
  const getRoom = (gameId) => `game:${gameId}`;

  //Helper Function: Check for winner or draw
  const checkWinner = (board) => {
    //Check rows/columns
    for (let i = 0; i < 3; i++) {
      if (board[i][0] && board[i][0] === board[i][1] && board[i][1] === board[i][2]) return board[i][0];
      if (board[0][i] && board[0][i] === board[1][i] && board[1][i] === board[2][i]) return board[0][i];
    }
    //Check diagonals
    if (board[0][0] && board[0][0] === board[1][1] && board[1][1] === board[2][2]) return board[0][0];
    if (board[0][2] && board[0][2] === board[1][1] && board[1][1] === board[2][0]) return board[0][2];
    //Check for draw
    if (board.flat().every(cell => cell)) return 'draw';

    //No winner yet
    return null;
  };

  //POST method /api/games/create: Creates a new game
  router.post('/create', async (req, res) => {
    try {
      //Extract playerName
      const { playerName } = req.body;
      //Null check
      if (!playerName) return res.status(400).json({ error: 'Missing playerName' });

      //Create game document
      const gameId = Date.now().toString();
      const game = {
        _id: gameId,
        players: [playerName], //First player
        board: Array(3).fill().map(() => Array(3).fill(null)), //3x3 board
        currentPlayer: 'X', //X goes first
        winner: null,
        completed: false,
        createdAt: new Date()
      };

      //Insert game into database
      await gamesCollection.insertOne(game);

      //Signals the room created with socket.io
      io.to(getRoom(gameId)).emit('gameCreated', { gameId, game });

      //Respond with success
      res.json({ success: true, gameId, game });

    } catch (err) { res.status(500).json({ error: 'Failed to create game' }); }
  });

  //POST method /api/games/join: Join an existing game
  router.post('/join', async (req, res) => {
    try {
      //Extract gameId and playerName
      const { gameId, playerName } = req.body;
      //Null check
      if (!gameId || !playerName) return res.status(400).json({ error: 'Missing gameId or playerName' });

      //Get game from database
      const game = await gamesCollection.findOne({ _id: gameId });

      //Null check and validations
      if (!game) return res.status(404).json({ error: 'Game not found' });
      if (game.players.length >= 2) return res.status(400).json({ error: 'Game is full' });
      if (game.players.includes(playerName)) return res.status(400).json({ error: 'Player already in game' });

      //Add player to game and update in database
      game.players.push(playerName);
      await gamesCollection.updateOne({ _id: gameId }, { $set: { players: game.players } });

      // Notify room via socket.io
      io.to(getRoom(gameId)).emit('playerJoined', { gameId, playerName });
      //Respond with success
      res.json({ success: true, game });

    } catch (err) { res.status(500).json({ error: 'Failed to join game' }); }
  });

  //POST method /api/games/move: Make a move
  router.post('/move', async (req, res) => {
    try {
      //Extract required fields
      const { gameId, playerName, row, col } = req.body;
      //Null check
      if (!gameId || !playerName || row === undefined || col === undefined) return res.status(400).json({ error: 'Missing required fields' });

      // Get game from database
      const game = await gamesCollection.findOne({ _id: gameId });
      //Null check and validations
      if (!game) return res.status(404).json({ error: 'Game not found' });
      if (game.completed) return res.status(400).json({ error: 'Game is completed' });

      //Check if player is part of the game
      const playerIndex = game.players.indexOf(playerName);
      if (playerIndex === -1) return res.status(400).json({ error: 'Player not in game' });

      //Assign symbol and validate turn
      const symbol = playerIndex === 0 ? 'X' : 'O';
      if (game.currentPlayer !== symbol) return res.status(400).json({ error: 'Not your turn' });
      if (game.board[row][col]) return res.status(400).json({ error: 'Cell already occupied' });

      //Place symbol
      game.board[row][col] = symbol;
      //Switch turn
      game.currentPlayer = game.currentPlayer === 'X' ? 'O' : 'X';
      //Check for winner
      game.winner = checkWinner(game.board);
      //Mark game as complete
      if (game.winner) game.completed = true;

      // Update game in database
      await gamesCollection.updateOne(
        { _id: gameId },
        {
          $set: {
            board: game.board,
            currentPlayer: game.currentPlayer,
            winner: game.winner,
            completed: game.completed
          }
        }
      );

      //Notify room via socket.io
      io.to(getRoom(gameId)).emit('moveMade', { gameId, row, col, symbol, winner: game.winner }); // Notify room
      //Respond with success
      res.json({ success: true, game });

    } catch (err) { res.status(500).json({ error: 'Failed to make move' }); }
  });

  //GET method /api/games/:gameId: Get the current state of a game
  router.get('/:gameId', async (req, res) => {
    try {
      //Extract gameId from params
      const { gameId } = req.params;
      // Get game from database
      const game = await gamesCollection.findOne({ _id: gameId });
      //Null check
      if (!game) return res.status(404).json({ error: 'Game not found' });
      //Respond with game state
      res.json({ game });

    } catch (err) {
      console.error('Error getting game:', err);
      res.status(500).json({ error: 'Failed to get game' });
    }
  });

  // GET method /api/games/history: Get completed games for history
  router.get('/history', async (req, res) => {
    try {
      //Get all completed games, sorted by creation date (newest first)
      const completedGames = await gamesCollection
        .find({ completed: true })
        .sort({ createdAt: -1 })
        .toArray();

      //Respond with game history
      res.json({ games: completedGames });

    } catch (err) {
      console.error('Error getting game history:', err);
      res.status(500).json({ error: 'Failed to get game history' });
    }
  });

  //POST method /api/games/reset: Reset all games
  router.post('/reset', async (req, res) => {
    try {
      // Delete all games from database
      await gamesCollection.deleteMany({});
      // Respond with success
      res.json({ success: true });

    } catch (err) { res.status(500).json({ error: 'Failed to reset games' }); }
  });

  return router;
};