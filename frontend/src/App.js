// Main App component
import React from "react";
import { Route, Routes } from "react-router-dom";
import { SocketProvider } from './socket'; // Provides Socket.IO context
import './styles.css'; // Global styles

// Components
import Start from './components/Start'; // Start screen for creating/joining games
import Game from './components/Game'; // Game board component
import History from './components/History'; // Game history component

function App() {
  return (
    <div>
      <SocketProvider> {/* Wrap app with Socket.IO provider */}
        <Routes>
          <Route path="/" element={<Start />} /> {/* Home page */}
          <Route path="/game" element={<Game />} /> {/* Game page */}
          <Route path="/history" element={<History />} /> {/* History page */}
        </Routes>
      </SocketProvider>
    </div>
  );
}

export default App;