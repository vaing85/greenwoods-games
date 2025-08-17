// Advanced Tournament System for Phase 8
class TournamentService {
  constructor() {
    this.tournaments = new Map();
    this.activeBrackets = new Map();
    this.tournamentHistory = [];
    
    this.tournamentTypes = {
      'elimination': 'Single Elimination',
      'double_elimination': 'Double Elimination',
      'round_robin': 'Round Robin',
      'swiss': 'Swiss System',
      'freeroll': 'Freeroll',
      'satellite': 'Satellite Tournament'
    };
    
    this.prizeStructures = {
      'winner_takes_all': [100],
      'top_3': [60, 30, 10],
      'top_5': [40, 25, 15, 12, 8],
      'top_10': [30, 20, 12, 8, 6, 5, 4, 3, 2, 2],
      'proportional': [] // Calculate based on participants
    };
  }

  // Create a new tournament
  createTournament(tournamentData) {
    const {
      name,
      gameType,
      tournamentType,
      buyIn,
      maxParticipants,
      minParticipants,
      startTime,
      registrationEnd,
      prizeStructure,
      description,
      createdBy
    } = tournamentData;

    const tournamentId = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const tournament = {
      id: tournamentId,
      name,
      gameType,
      tournamentType,
      buyIn,
      maxParticipants,
      minParticipants: minParticipants || 2,
      startTime: new Date(startTime),
      registrationEnd: new Date(registrationEnd),
      prizeStructure,
      description,
      createdBy,
      createdAt: new Date(),
      status: 'registration', // registration, ready, active, completed, cancelled
      participants: [],
      brackets: null,
      currentRound: 0,
      totalPrizePool: 0,
      actualPrizePool: 0,
      settings: {
        blindLevels: this.generateBlindLevels(tournamentType),
        levelDuration: 15 * 60 * 1000, // 15 minutes per level
        breakFrequency: 4, // Break every 4 levels
        breakDuration: 5 * 60 * 1000, // 5 minute breaks
        lateRegistration: tournamentType !== 'elimination',
        rebuyAllowed: false,
        addonAllowed: false
      },
      statistics: {
        totalEntries: 0,
        averageBuyIn: 0,
        completionRate: 0,
        averageDuration: 0
      }
    };

    this.tournaments.set(tournamentId, tournament);
    console.log(`🏆 Tournament created: ${name} (${tournamentId})`);
    
    return tournament;
  }

  // Register player for tournament
  async registerPlayer(tournamentId, playerId, playerData) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    // Validation checks
    if (tournament.status !== 'registration') {
      throw new Error('Registration is closed for this tournament');
    }

    if (new Date() > tournament.registrationEnd) {
      throw new Error('Registration deadline has passed');
    }

    if (tournament.participants.length >= tournament.maxParticipants) {
      throw new Error('Tournament is full');
    }

    if (tournament.participants.some(p => p.playerId === playerId)) {
      throw new Error('Player already registered');
    }

    // Add player to tournament
    const participant = {
      playerId,
      username: playerData.username,
      registeredAt: new Date(),
      buyInPaid: tournament.buyIn,
      status: 'registered', // registered, active, eliminated, winner
      currentChips: 0,
      position: null,
      winnings: 0,
      statistics: {
        handsPlayed: 0,
        totalBets: 0,
        biggestWin: 0,
        knockouts: 0
      }
    };

    tournament.participants.push(participant);
    tournament.totalPrizePool += tournament.buyIn;
    tournament.actualPrizePool = tournament.totalPrizePool * 0.9; // 10% house rake

    // Check if tournament is ready to start
    if (tournament.participants.length >= tournament.minParticipants) {
      tournament.status = 'ready';
    }

    this.tournaments.set(tournamentId, tournament);
    
    return {
      success: true,
      tournament: this.getTournamentSummary(tournament),
      participant
    };
  }

  // Start tournament
  async startTournament(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status !== 'ready') {
      throw new Error('Tournament is not ready to start');
    }

    if (tournament.participants.length < tournament.minParticipants) {
      throw new Error('Not enough participants to start tournament');
    }

    // Initialize tournament
    tournament.status = 'active';
    tournament.startedAt = new Date();
    tournament.currentRound = 1;

    // Create brackets based on tournament type
    tournament.brackets = this.createBrackets(tournament);

    // Initialize player chips
    const startingChips = this.calculateStartingChips(tournament);
    tournament.participants.forEach(participant => {
      participant.currentChips = startingChips;
      participant.status = 'active';
    });

    this.tournaments.set(tournamentId, tournament);
    this.activeBrackets.set(tournamentId, tournament.brackets);

    console.log(`🚀 Tournament started: ${tournament.name}`);
    
    return {
      success: true,
      tournament: this.getTournamentSummary(tournament),
      brackets: tournament.brackets,
      startingChips
    };
  }

  // Create brackets based on tournament type
  createBrackets(tournament) {
    const participants = [...tournament.participants];
    
    switch (tournament.tournamentType) {
      case 'elimination':
        return this.createEliminationBracket(participants);
      case 'double_elimination':
        return this.createDoubleEliminationBracket(participants);
      case 'round_robin':
        return this.createRoundRobinBracket(participants);
      case 'swiss':
        return this.createSwissBracket(participants);
      default:
        return this.createEliminationBracket(participants);
    }
  }

  // Single elimination bracket
  createEliminationBracket(participants) {
    const shuffled = this.shuffleArray([...participants]);
    const rounds = Math.ceil(Math.log2(shuffled.length));
    const bracket = [];

    // Create first round pairings
    const firstRound = [];
    for (let i = 0; i < shuffled.length; i += 2) {
      const match = {
        id: `match_r1_${i / 2 + 1}`,
        round: 1,
        player1: shuffled[i],
        player2: shuffled[i + 1] || null, // Bye if odd number
        winner: null,
        status: 'pending', // pending, active, completed
        startTime: null,
        endTime: null,
        gameData: null
      };
      
      // Auto-advance if bye
      if (!match.player2) {
        match.winner = match.player1;
        match.status = 'completed';
      }
      
      firstRound.push(match);
    }

    bracket.push(firstRound);

    // Create subsequent rounds
    for (let round = 2; round <= rounds; round++) {
      const previousRound = bracket[round - 2];
      const currentRound = [];
      
      for (let i = 0; i < previousRound.length; i += 2) {
        if (i + 1 < previousRound.length) {
          currentRound.push({
            id: `match_r${round}_${Math.floor(i / 2) + 1}`,
            round,
            player1: null, // Will be filled when previous matches complete
            player2: null,
            winner: null,
            status: 'pending',
            startTime: null,
            endTime: null,
            gameData: null,
            dependsOn: [previousRound[i].id, previousRound[i + 1].id]
          });
        }
      }
      
      bracket.push(currentRound);
    }

    return {
      type: 'elimination',
      rounds: bracket,
      currentRound: 1,
      totalRounds: rounds
    };
  }

  // Advance tournament bracket
  advanceMatch(tournamentId, matchId, winnerId, matchData) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    const brackets = tournament.brackets;
    let match = null;
    let roundIndex = -1;
    let matchIndex = -1;

    // Find the match
    for (let r = 0; r < brackets.rounds.length; r++) {
      for (let m = 0; m < brackets.rounds[r].length; m++) {
        if (brackets.rounds[r][m].id === matchId) {
          match = brackets.rounds[r][m];
          roundIndex = r;
          matchIndex = m;
          break;
        }
      }
      if (match) break;
    }

    if (!match) {
      throw new Error('Match not found');
    }

    if (match.status === 'completed') {
      throw new Error('Match already completed');
    }

    // Validate winner
    const winner = tournament.participants.find(p => p.playerId === winnerId);
    if (!winner) {
      throw new Error('Winner not found in tournament');
    }

    if (match.player1?.playerId !== winnerId && match.player2?.playerId !== winnerId) {
      throw new Error('Winner must be one of the match participants');
    }

    // Update match
    match.winner = winner;
    match.status = 'completed';
    match.endTime = new Date();
    match.gameData = matchData;

    // Update participant status
    const loser = match.player1?.playerId === winnerId ? match.player2 : match.player1;
    if (loser) {
      const loserParticipant = tournament.participants.find(p => p.playerId === loser.playerId);
      if (loserParticipant) {
        loserParticipant.status = 'eliminated';
        loserParticipant.position = this.calculatePosition(tournament, loserParticipant);
      }
    }

    // Advance to next round if applicable
    if (roundIndex + 1 < brackets.rounds.length) {
      const nextRound = brackets.rounds[roundIndex + 1];
      const nextMatchIndex = Math.floor(matchIndex / 2);
      
      if (nextMatchIndex < nextRound.length) {
        const nextMatch = nextRound[nextMatchIndex];
        
        if (matchIndex % 2 === 0) {
          nextMatch.player1 = winner;
        } else {
          nextMatch.player2 = winner;
        }

        // Start next match if both players are set
        if (nextMatch.player1 && nextMatch.player2) {
          nextMatch.status = 'active';
          nextMatch.startTime = new Date();
        }
      }
    } else {
      // Tournament completed
      winner.status = 'winner';
      winner.position = 1;
      tournament.status = 'completed';
      tournament.completedAt = new Date();
      
      this.distributePrizes(tournament);
    }

    this.tournaments.set(tournamentId, tournament);
    
    return {
      success: true,
      match,
      tournament: this.getTournamentSummary(tournament),
      nextMatches: this.getActiveMatches(tournament)
    };
  }

  // Calculate starting chips based on tournament settings
  calculateStartingChips(tournament) {
    const baseChips = tournament.buyIn * 100; // 100 chips per dollar
    return Math.max(baseChips, 1000); // Minimum 1000 chips
  }

  // Generate blind levels for tournament
  generateBlindLevels(tournamentType) {
    const levels = [
      { level: 1, smallBlind: 10, bigBlind: 20, ante: 0 },
      { level: 2, smallBlind: 15, bigBlind: 30, ante: 0 },
      { level: 3, smallBlind: 25, bigBlind: 50, ante: 0 },
      { level: 4, smallBlind: 50, bigBlind: 100, ante: 0 },
      { level: 5, smallBlind: 75, bigBlind: 150, ante: 25 },
      { level: 6, smallBlind: 100, bigBlind: 200, ante: 25 },
      { level: 7, smallBlind: 150, bigBlind: 300, ante: 50 },
      { level: 8, smallBlind: 200, bigBlind: 400, ante: 50 },
      { level: 9, smallBlind: 300, bigBlind: 600, ante: 75 },
      { level: 10, smallBlind: 400, bigBlind: 800, ante: 100 }
    ];

    // Add more levels for longer tournaments
    if (tournamentType === 'swiss' || tournamentType === 'round_robin') {
      for (let i = 11; i <= 20; i++) {
        const prevLevel = levels[i - 2];
        levels.push({
          level: i,
          smallBlind: Math.floor(prevLevel.smallBlind * 1.5),
          bigBlind: Math.floor(prevLevel.bigBlind * 1.5),
          ante: Math.floor(prevLevel.ante * 1.5)
        });
      }
    }

    return levels;
  }

  // Distribute prizes based on tournament structure
  distributePrizes(tournament) {
    const prizeStructure = this.prizeStructures[tournament.prizeStructure] || this.prizeStructures['top_3'];
    const totalPrize = tournament.actualPrizePool;
    
    // Sort participants by position
    const finishers = tournament.participants
      .filter(p => p.position !== null)
      .sort((a, b) => a.position - b.position);

    finishers.forEach((participant, index) => {
      if (index < prizeStructure.length) {
        const prizePercentage = prizeStructure[index] / 100;
        participant.winnings = totalPrize * prizePercentage;
      }
    });

    // Log prize distribution
    console.log(`💰 Prizes distributed for tournament ${tournament.name}:`);
    finishers.slice(0, prizeStructure.length).forEach((p, i) => {
      console.log(`${i + 1}. ${p.username}: $${p.winnings.toFixed(2)}`);
    });
  }

  // Calculate participant position
  calculatePosition(tournament, participant) {
    const eliminated = tournament.participants.filter(p => p.status === 'eliminated');
    return tournament.participants.length - eliminated.length + 1;
  }

  // Get active matches that can be played
  getActiveMatches(tournament) {
    if (!tournament.brackets) return [];
    
    const activeMatches = [];
    tournament.brackets.rounds.forEach(round => {
      round.forEach(match => {
        if (match.status === 'active' || (match.status === 'pending' && match.player1 && match.player2)) {
          activeMatches.push(match);
        }
      });
    });
    
    return activeMatches;
  }

  // Get tournament leaderboard
  getTournamentLeaderboard(tournamentId) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) return null;

    const leaderboard = tournament.participants
      .map(p => ({
        playerId: p.playerId,
        username: p.username,
        position: p.position,
        status: p.status,
        currentChips: p.currentChips,
        winnings: p.winnings,
        statistics: p.statistics
      }))
      .sort((a, b) => {
        if (a.position && b.position) return a.position - b.position;
        if (a.position && !b.position) return -1;
        if (!a.position && b.position) return 1;
        return (b.currentChips || 0) - (a.currentChips || 0);
      });

    return {
      tournament: this.getTournamentSummary(tournament),
      leaderboard,
      prizeStructure: this.calculatePrizeDistribution(tournament),
      activeMatches: this.getActiveMatches(tournament)
    };
  }

  // Calculate prize distribution
  calculatePrizeDistribution(tournament) {
    const prizeStructure = this.prizeStructures[tournament.prizeStructure] || this.prizeStructures['top_3'];
    const totalPrize = tournament.actualPrizePool;
    
    return prizeStructure.map((percentage, index) => ({
      position: index + 1,
      percentage,
      amount: (totalPrize * percentage / 100).toFixed(2)
    }));
  }

  // Get tournament summary
  getTournamentSummary(tournament) {
    return {
      id: tournament.id,
      name: tournament.name,
      gameType: tournament.gameType,
      tournamentType: tournament.tournamentType,
      status: tournament.status,
      buyIn: tournament.buyIn,
      participants: tournament.participants.length,
      maxParticipants: tournament.maxParticipants,
      totalPrizePool: tournament.totalPrizePool,
      actualPrizePool: tournament.actualPrizePool,
      startTime: tournament.startTime,
      registrationEnd: tournament.registrationEnd,
      currentRound: tournament.currentRound,
      description: tournament.description
    };
  }

  // Utility function to shuffle array
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  // Get all tournaments
  getAllTournaments() {
    return Array.from(this.tournaments.values()).map(t => this.getTournamentSummary(t));
  }

  // Get tournaments by status
  getTournamentsByStatus(status) {
    return Array.from(this.tournaments.values())
      .filter(t => t.status === status)
      .map(t => this.getTournamentSummary(t));
  }

  // Cancel tournament
  cancelTournament(tournamentId, reason) {
    const tournament = this.tournaments.get(tournamentId);
    if (!tournament) {
      throw new Error('Tournament not found');
    }

    if (tournament.status === 'completed') {
      throw new Error('Cannot cancel completed tournament');
    }

    tournament.status = 'cancelled';
    tournament.cancelledAt = new Date();
    tournament.cancellationReason = reason;

    // Refund participants
    tournament.participants.forEach(participant => {
      participant.winnings = tournament.buyIn; // Full refund
    });

    this.tournaments.set(tournamentId, tournament);
    
    console.log(`❌ Tournament cancelled: ${tournament.name} - ${reason}`);
    
    return {
      success: true,
      tournament: this.getTournamentSummary(tournament),
      refunds: tournament.participants.map(p => ({
        playerId: p.playerId,
        refundAmount: tournament.buyIn
      }))
    };
  }
}

module.exports = TournamentService;
