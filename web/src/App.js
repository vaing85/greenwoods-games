import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io from 'socket.io-client';
import Header from './components/Header';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import SlotMachine from './components/games/SlotMachine';
import Blackjack from './components/games/Blackjack';
import Roulette from './components/games/Roulette';
import Poker from './components/games/Poker';
import LivePoker from './components/games/LivePoker';
import TournamentLobby from './components/games/TournamentLobby';
import Baccarat from './components/games/Baccarat';
import Craps from './components/games/Craps';
import VideoPoker from './components/games/VideoPoker';
import { AuthProvider, useAuth } from './context/AuthContext';

const socket = io('http://localhost:5000');

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Header />
          <main className="container">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/dashboard" element={
                <ProtectedRoute>
                  <Dashboard socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/games/slots" element={
                <ProtectedRoute>
                  <SlotMachine socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/games/blackjack" element={
                <ProtectedRoute>
                  <Blackjack socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/games/roulette" element={
                <ProtectedRoute>
                  <Roulette socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/games/poker" element={
                <ProtectedRoute>
                  <Poker socket={socket} />
                </ProtectedRoute>
              } />
              <Route path="/games/live-poker" element={
                <ProtectedRoute>
                  <LivePoker />
                </ProtectedRoute>
              } />
              <Route path="/tournaments" element={
                <ProtectedRoute>
                  <TournamentLobby />
                </ProtectedRoute>
              } />
              <Route path="/games/baccarat" element={
                <ProtectedRoute>
                  <Baccarat />
                </ProtectedRoute>
              } />
              <Route path="/games/craps" element={
                <ProtectedRoute>
                  <Craps />
                </ProtectedRoute>
              } />
              <Route path="/games/video-poker" element={
                <ProtectedRoute>
                  <VideoPoker />
                </ProtectedRoute>
              } />
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

export default App;
