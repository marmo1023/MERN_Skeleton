// History component - displays completed games
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

function History() {
  // State for storing game history
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch game history on component mount
  useEffect(() => {
    fetchGameHistory();
  }, []);

  // Function to fetch completed games from backend
  const fetchGameHistory = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/games/history');
      if (!response.ok) {
        throw new Error('Failed to fetch game history');
      }
      const data = await response.json();
      setGames(data.games);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  // Helper function to get winner display text
  const getWinnerText = (game) => {
    if (game.winner === 'draw') return 'Draw';
    if (game.winner === 'X') return `${game.players[0]} (X) won`;
    if (game.winner === 'O') return `${game.players[1]} (O) won`;
    return 'Unknown';
  };

  // Show loading state
  if (loading) {
    return (
      <div className="container">
        <h1>Game History</h1>
        <p>Loading game history...</p>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="container">
        <h1>Game History</h1>
        <p>Error: {error}</p>
        <button onClick={fetchGameHistory}>Retry</button>
      </div>
    );
  }

  return (
    <div className="container">
      <h1>Game History</h1>

      {/* Navigation */}
      <nav className="nav">
        <Link to="/" className="nav-link">Home</Link>
        <button onClick={fetchGameHistory} className="refresh-btn">Refresh</button>
      </nav>

      {/* Game history list */}
      {games.length === 0 ? (
        <p>No completed games yet. Play some games to see history!</p>
      ) : (
        <div className="history-list">
          {games.map((game) => (
            <div key={game._id} className="history-item">
              <div className="history-header">
                <h3>Game #{game._id.slice(-6)}</h3>
                <span className="game-date">{formatDate(game.createdAt)}</span>
              </div>

              <div className="history-players">
                <p><strong>Players:</strong> {game.players.join(' vs ')}</p>
                <p><strong>Result:</strong> {getWinnerText(game)}</p>
              </div>

              {/* Mini board display */}
              <div className="mini-board">
                {game.board.map((row, rowIndex) => (
                  <div key={rowIndex} className="mini-row">
                    {row.map((cell, colIndex) => (
                      <div key={colIndex} className="mini-cell">
                        {cell || ''}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default History;