import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import io from 'socket.io-client';
import './TournamentLobby.css';

const TournamentLobby = () => {
  const { user, token } = useAuth();
  const [socket, setSocket] = useState(null);
  const [tournaments, setTournaments] = useState([]);
  const [registeredTournaments, setRegisteredTournaments] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Create Tournament Form
  const [createForm, setCreateForm] = useState({
    name: '',
    maxPlayers: 9,
    buyIn: 100,
    startingChips: 2000,
    blindStructure: 'standard',
    prizeStructure: 'standard',
    startTime: ''
  });

  useEffect(() => {
    if (!user) return;

    const newSocket = io('http://localhost:5000', {
      auth: { token }
    });

    newSocket.on('connect', () => {
      console.log('Connected to tournament system');
      newSocket.emit('getTournaments');
    });

    newSocket.on('tournamentsUpdate', (data) => {
      setTournaments(data.tournaments);
      setRegisteredTournaments(data.registered || []);
    });

    newSocket.on('tournamentCreated', (tournament) => {
      setTournaments(prev => [...prev, tournament]);
      setShowCreateModal(false);
    });

    newSocket.on('tournamentRegistered', (tournament) => {
      setRegisteredTournaments(prev => [...prev, tournament._id]);
    });

    newSocket.on('tournamentUnregistered', (tournamentId) => {
      setRegisteredTournaments(prev => prev.filter(id => id !== tournamentId));
    });

    newSocket.on('tournamentStarted', (tournamentId) => {
      // Redirect to tournament play
      console.log('Tournament started:', tournamentId);
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, [user, token]);

  const handleCreateTournament = (e) => {
    e.preventDefault();
    if (socket) {
      socket.emit('createTournament', createForm);
    }
  };

  const handleRegister = (tournamentId) => {
    if (socket) {
      socket.emit('registerTournament', { tournamentId });
    }
  };

  const handleUnregister = (tournamentId) => {
    if (socket) {
      socket.emit('unregisterTournament', { tournamentId });
    }
  };

  const formatTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const getTournamentStatus = (tournament) => {
    const now = new Date();
    const startTime = new Date(tournament.startTime);
    
    if (tournament.status === 'completed') return 'Completed';
    if (tournament.status === 'active') return 'In Progress';
    if (now >= startTime) return 'Starting Soon';
    return 'Scheduled';
  };

  const getPrizePool = (tournament) => {
    return tournament.registeredPlayers.length * tournament.buyIn;
  };

  if (!user) {
    return (
      <div className="tournament-container">
        <div className="login-required">
          <h2>Login Required</h2>
          <p>Please log in to view tournaments</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tournament-container">
      <div className="tournament-header">
        <h2>Tournament Lobby</h2>
        <button 
          className="create-tournament-btn"
          onClick={() => setShowCreateModal(true)}
        >
          Create Tournament
        </button>
      </div>

      {/* My Tournaments */}
      {registeredTournaments.length > 0 && (
        <div className="my-tournaments">
          <h3>My Tournaments</h3>
          <div className="tournaments-grid">
            {tournaments
              .filter(t => registeredTournaments.includes(t._id))
              .map(tournament => (
                <div key={tournament._id} className="tournament-card registered">
                  <div className="tournament-header-card">
                    <h4>{tournament.name}</h4>
                    <span className={`status ${tournament.status}`}>
                      {getTournamentStatus(tournament)}
                    </span>
                  </div>
                  <div className="tournament-details">
                    <p><strong>Buy-in:</strong> ${tournament.buyIn}</p>
                    <p><strong>Prize Pool:</strong> ${getPrizePool(tournament)}</p>
                    <p><strong>Players:</strong> {tournament.registeredPlayers.length}/{tournament.maxPlayers}</p>
                    <p><strong>Start Time:</strong> {formatTime(tournament.startTime)}</p>
                    <p><strong>Starting Chips:</strong> {tournament.startingChips.toLocaleString()}</p>
                  </div>
                  <div className="tournament-actions">
                    {tournament.status === 'scheduled' && (
                      <button 
                        className="unregister-btn"
                        onClick={() => handleUnregister(tournament._id)}
                      >
                        Unregister
                      </button>
                    )}
                    {tournament.status === 'active' && (
                      <button className="play-btn">
                        Play Now
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Available Tournaments */}
      <div className="available-tournaments">
        <h3>Available Tournaments</h3>
        {tournaments.length === 0 ? (
          <div className="no-tournaments">
            <p>No tournaments available. Create one to get started!</p>
          </div>
        ) : (
          <div className="tournaments-grid">
            {tournaments
              .filter(t => !registeredTournaments.includes(t._id))
              .map(tournament => (
                <div key={tournament._id} className="tournament-card">
                  <div className="tournament-header-card">
                    <h4>{tournament.name}</h4>
                    <span className={`status ${tournament.status}`}>
                      {getTournamentStatus(tournament)}
                    </span>
                  </div>
                  <div className="tournament-details">
                    <p><strong>Buy-in:</strong> ${tournament.buyIn}</p>
                    <p><strong>Prize Pool:</strong> ${getPrizePool(tournament)}</p>
                    <p><strong>Players:</strong> {tournament.registeredPlayers.length}/{tournament.maxPlayers}</p>
                    <p><strong>Start Time:</strong> {formatTime(tournament.startTime)}</p>
                    <p><strong>Starting Chips:</strong> {tournament.startingChips.toLocaleString()}</p>
                    <p><strong>Blind Structure:</strong> {tournament.blindStructure}</p>
                  </div>
                  <div className="tournament-actions">
                    {tournament.status === 'scheduled' && 
                     tournament.registeredPlayers.length < tournament.maxPlayers && 
                     user.balance >= tournament.buyIn && (
                      <button 
                        className="register-btn"
                        onClick={() => handleRegister(tournament._id)}
                      >
                        Register (${tournament.buyIn})
                      </button>
                    )}
                    {tournament.status === 'scheduled' && user.balance < tournament.buyIn && (
                      <button className="register-btn disabled" disabled>
                        Insufficient Balance
                      </button>
                    )}
                    {tournament.registeredPlayers.length >= tournament.maxPlayers && (
                      <button className="register-btn disabled" disabled>
                        Tournament Full
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        )}
      </div>

      {/* Create Tournament Modal */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="create-tournament-modal" onClick={e => e.stopPropagation()}>
            <h3>Create New Tournament</h3>
            <form onSubmit={handleCreateTournament}>
              <div className="form-group">
                <label>Tournament Name</label>
                <input
                  type="text"
                  value={createForm.name}
                  onChange={(e) => setCreateForm({...createForm, name: e.target.value})}
                  required
                  placeholder="Enter tournament name"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Max Players</label>
                  <select
                    value={createForm.maxPlayers}
                    onChange={(e) => setCreateForm({...createForm, maxPlayers: parseInt(e.target.value)})}
                  >
                    <option value={6}>6 Players</option>
                    <option value={9}>9 Players</option>
                    <option value={18}>18 Players</option>
                    <option value={27}>27 Players</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Buy-in ($)</label>
                  <input
                    type="number"
                    value={createForm.buyIn}
                    onChange={(e) => setCreateForm({...createForm, buyIn: parseInt(e.target.value)})}
                    min="1"
                    max="1000"
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Starting Chips</label>
                  <select
                    value={createForm.startingChips}
                    onChange={(e) => setCreateForm({...createForm, startingChips: parseInt(e.target.value)})}
                  >
                    <option value={1000}>1,000 Chips</option>
                    <option value={2000}>2,000 Chips</option>
                    <option value={5000}>5,000 Chips</option>
                    <option value={10000}>10,000 Chips</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Start Time</label>
                  <input
                    type="datetime-local"
                    value={createForm.startTime}
                    onChange={(e) => setCreateForm({...createForm, startTime: e.target.value})}
                    min={new Date().toISOString().slice(0, 16)}
                    required
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blind Structure</label>
                  <select
                    value={createForm.blindStructure}
                    onChange={(e) => setCreateForm({...createForm, blindStructure: e.target.value})}
                  >
                    <option value="standard">Standard (10 min levels)</option>
                    <option value="fast">Fast (5 min levels)</option>
                    <option value="slow">Slow (15 min levels)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Prize Structure</label>
                  <select
                    value={createForm.prizeStructure}
                    onChange={(e) => setCreateForm({...createForm, prizeStructure: e.target.value})}
                  >
                    <option value="standard">Standard (Winner takes 60%)</option>
                    <option value="flat">Flat (Winner takes all)</option>
                    <option value="top3">Top 3 (50%/30%/20%)</option>
                  </select>
                </div>
              </div>

              <div className="form-actions">
                <button type="button" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </button>
                <button type="submit">
                  Create Tournament
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TournamentLobby;
