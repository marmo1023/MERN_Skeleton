// Game component: Displays the tic-tac-toe board and handles gameplay
import React, { useEffect, useState, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { SocketContext } from '../socket'; //Socket.IO context
import '../styles.css';

export default function Game() {
  const navigate = useNavigate(); //Navigation hook
  const location = useLocation(); //Location hook for state
  const socket = useContext(SocketContext); //Socket.IO instance

  const { gameId, myName } = location.state || {}; // Game ID and player name from navigation state
  const [game, setGame] = useState(null); // Current game state
  const [error, setError] = useState(null); // Error message

  useEffect(() => {
    if (!gameId || !myName) {
      navigate('/'); // Redirect if no game data
      return;
    }

    // Fetch initial game state from server
    fetch(`http://localhost:5000/api/games/${gameId}`)
      .then(res => res.json())
      .then(data => {
        if (data.game) {
          setGame(data.game);
        } else {
          setError('Game not found');
        }
      })
      .catch(err => setError('Failed to load game'));

    // Join the game room via Socket.IO
    socket.emit('joinGame', { gameId });

    // Event listeners for real-time updates
    const onMoveMade = (data) => {
      if (data.gameId === gameId) {
        // Update game state when a move is made
        setGame(prev => ({ ...prev, board: data.board || prev.board, currentPlayer: data.currentPlayer || prev.currentPlayer, winner: data.winner, completed: !!data.winner }));
      }
    };

    const onPlayerJoined = (data) => {
      if (data.gameId === gameId) {
        // Update players list when someone joins
        setGame(prev => ({ ...prev, players: [...prev.players, data.playerName] }));
      }
    };

    // Register listeners
    socket.on('moveMade', onMoveMade);
    socket.on('playerJoined', onPlayerJoined);

    // Cleanup listeners on unmount
    return () => {
      socket.off('moveMade', onMoveMade);
      socket.off('playerJoined', onPlayerJoined);
    };
  }, [socket, gameId, myName, navigate]);

  // Handle clicking on a board cell
  const handleCellClick = async (row, col) => {
    if (!game || game.completed || game.board[row][col] || game.players.indexOf(myName) !== (game.currentPlayer === 'X' ? 0 : 1)) {
      return; // Prevent invalid moves
    }

    try {
      // Send move to server
      const res = await fetch('http://localhost:5000/api/games/move', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId, playerName: myName, row, col })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Move failed');
      } else {
        setGame(data.game); // Update local state
      }
    } catch (err) {
      setError('Network error');
    }
  };

  // Show error if any
  if (error) return <div className="error">{error}</div>;
  // Show loading if game not loaded
  if (!game) return <div>Loading...</div>;

  // Determine player's symbol and if it's their turn
  const mySymbol = game.players.indexOf(myName) === 0 ? 'X' : 'O';
  const isMyTurn = game.currentPlayer === mySymbol && !game.completed;

  return (
    <div className="game-container">
      <h2>Tic-Tac-Toe</h2>
      <div className="game-info">
        <p>Players: {game.players.join(' vs ')}</p>
        <p>You are: {mySymbol}</p>
        <p>Current turn: {game.currentPlayer}</p>
        {game.winner && <p className="winner">Winner: {game.winner === 'draw' ? 'Draw' : game.winner}</p>}
        {!game.completed && isMyTurn && <p>Your turn!</p>}
      </div>
      {/* Render the board */}
      <div className="board">
        {game.board.map((row, r) => (
          <div key={r} className="row">
            {row.map((cell, c) => (
              <div
                key={c}
                className={`cell ${cell ? 'occupied' : ''}`}
                onClick={() => handleCellClick(r, c)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
      <button onClick={() => navigate('/')}>Back to Start</button>
    </div>
  );
}