// Start component: Allows users to create or join a game
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

export default function Start() {
  const navigate = useNavigate(); // Hook for navigation
  const [name, setName] = useState(''); // User's name
  const [gameId, setGameId] = useState(''); // Game ID for joining
  const [mode, setMode] = useState('create'); // 'create' or 'join' mode

  // Handle creating a new game
  const handleCreateGame = async () => {
    if (!name.trim()) return alert('Enter your name');
    try {
      const res = await fetch('http://localhost:5000/api/games/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create game');
      // Navigate to game page with game details
      navigate('/game', { state: { gameId: data.gameId, myName: name.trim() } });
    } catch (err) {
      alert(err.message);
    }
  };

  // Handle joining an existing game
  const handleJoinGame = async () => {
    if (!name.trim() || !gameId.trim()) return alert('Enter name and game ID');
    try {
      const res = await fetch('http://localhost:5000/api/games/join', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ gameId: gameId.trim(), playerName: name.trim() })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to join game');
      // Navigate to game page
      navigate('/game', { state: { gameId: gameId.trim(), myName: name.trim() } });
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="mainContainer">
      <h1>Tic-Tac-Toe</h1>
      <nav className="nav">
        <Link to="/history" className="nav-link">View Game History</Link>
      </nav>
      <div className="organizer">
        {/* Input for player's name */}
        <input
          className="textbox"
          placeholder="Your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        {/* Radio buttons to choose mode */}
        <div>
          <label>
            <input
              type="radio"
              value="create"
              checked={mode === 'create'}
              onChange={(e) => setMode(e.target.value)}
            />
            Create New Game
          </label>
          <label>
            <input
              type="radio"
              value="join"
              checked={mode === 'join'}
              onChange={(e) => setMode(e.target.value)}
            />
            Join Existing Game
          </label>
        </div>
        {/* Game ID input, shown only in join mode */}
        {mode === 'join' && (
          <input
            className="textbox"
            placeholder="Game ID"
            value={gameId}
            onChange={(e) => setGameId(e.target.value)}
          />
        )}
        {/* Button to create or join */}
        <button onClick={mode === 'create' ? handleCreateGame : handleJoinGame}>
          {mode === 'create' ? 'Create Game' : 'Join Game'}
        </button>
      </div>
    </div>
  );
}