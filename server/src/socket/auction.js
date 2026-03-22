const prisma = require('../db');
const { getNextBid, SET_NAMES, SQUAD_RULES, isOverseas } = require('../constants');

const auctions = {};
const timers = {};

function setupSocket(io) {
  io.on('connection', (socket) => {
    console.log('Connected:', socket.id);

    socket.on('join-room', ({ roomCode, teamId }) => {
      socket.join(roomCode);
      socket.roomCode = roomCode;
      socket.teamId = teamId;

      // If auction is already live, send current state to this socket
      const auction = auctions[roomCode];
      if (auction) {
        const player = auction.players[auction.currentIdx];
        if (player) {
          socket.emit('current-player', {
            player,
            setName: SET_NAMES[player.set],
            setNumber: player.set,
            playerIndex: auction.currentIdx,
            totalPlayers: auction.players.length,
            basePrice: player.basePrice,
            nextBid: auction.currentBid ? getNextBid(auction.currentBid) : player.basePrice,
            isOverseas: isOverseas(player.nationality),
          });
          if (auction.currentBid) {
            prisma.team.findUnique({ where: { id: auction.currentBidder } }).then(team => {
              if (team) {
                socket.emit('bid-update', {
                  currentBid: auction.currentBid,
                  bidderId: auction.currentBidder,
                  bidderName: team.name,
                  nextBid: getNextBid(auction.currentBid),
                });
              }
            });
          }
        }
        if (auction.paused) socket.emit('pause-update', { paused: true });
      }
    });

    socket.on('start-auction', async ({ roomCode }) => {
      const room = await prisma.room.findUnique({ where: { code: roomCode }, include: { teams: true } });
      if (!room) return;

      const players = await prisma.player.findMany({ orderBy: [{ set: 'asc' }, { basePrice: 'desc' }] });

      // Shuffle players within each set
      const bySet = {};
      players.forEach(p => { (bySet[p.set] = bySet[p.set] || []).push(p); });
      const shuffled = Object.keys(bySet).sort((a, b) => a - b).flatMap(s => {
        const arr = bySet[s];
        for (let i = arr.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [arr[i], arr[j]] = [arr[j], arr[i]]; }
        return arr;
      });

      auctions[roomCode] = {
        roomId: room.id,
        players: shuffled,
        currentIdx: 0,
        currentBid: null,
        currentBidder: null,
        timerSeconds: 15,
        unsold: [],
        paused: false,
      };

      await prisma.room.update({ where: { code: roomCode }, data: { status: 'live' } });

      const player = players[0];
      io.to(roomCode).emit('auction-started', { setName: SET_NAMES[player.set], setNumber: player.set });
      emitCurrentPlayer(io, roomCode);
    });

    socket.on('place-bid', async ({ roomCode }) => {
      const auction = auctions[roomCode];
      if (!auction || auction.paused || !socket.teamId) return;

      const currentPlayer = auction.players[auction.currentIdx];
      if (!currentPlayer) return;

      const nextBid = auction.currentBid ? getNextBid(auction.currentBid) : currentPlayer.basePrice;

      // Validate team constraints
      const team = await prisma.team.findUnique({ where: { id: socket.teamId } });
      if (!team || team.purse < nextBid) {
        return socket.emit('bid-error', { message: 'Not enough purse!' });
      }

      // Check squad size
      const squadCount = await prisma.soldPlayer.count({ where: { teamId: socket.teamId, roomId: auction.roomId } });
      if (squadCount >= SQUAD_RULES.MAX_SQUAD_SIZE) {
        return socket.emit('bid-error', { message: 'Squad full! (25 players max)' });
      }

      // Check overseas quota
      if (isOverseas(currentPlayer.nationality)) {
        const overseasCount = await prisma.soldPlayer.count({
          where: {
            teamId: socket.teamId,
            roomId: auction.roomId,
            player: { nationality: { not: 'IND' } }
          }
        });
        if (overseasCount >= SQUAD_RULES.MAX_OVERSEAS) {
          return socket.emit('bid-error', { message: 'Overseas quota full! (8 max)' });
        }
      }

      auction.currentBid = nextBid;
      auction.currentBidder = socket.teamId;
      auction.timerSeconds = 10;

      io.to(roomCode).emit('bid-update', {
        currentBid: auction.currentBid,
        bidderId: socket.teamId,
        bidderName: team.name,
        nextBid: getNextBid(auction.currentBid),
      });

      resetTimer(io, roomCode);
    });

    socket.on('sell-player', ({ roomCode }) => sellCurrentPlayer(io, roomCode));
    socket.on('unsold-player', ({ roomCode }) => markUnsold(io, roomCode));

    socket.on('next-player', ({ roomCode }) => {
      const auction = auctions[roomCode];
      if (!auction) return;
      auction.currentIdx++;
      auction.currentBid = null;
      auction.currentBidder = null;
      clearTimer(roomCode);

      if (auction.currentIdx >= auction.players.length) {
        io.to(roomCode).emit('auction-finished');
        prisma.room.update({ where: { code: roomCode }, data: { status: 'finished' } });
        delete auctions[roomCode];
        return;
      }

      const player = auction.players[auction.currentIdx];
      const prevPlayer = auction.players[auction.currentIdx - 1];
      if (player.set !== prevPlayer?.set) {
        io.to(roomCode).emit('new-set', { setName: SET_NAMES[player.set], setNumber: player.set });
      }
      emitCurrentPlayer(io, roomCode);
    });

    socket.on('toggle-pause', ({ roomCode }) => {
      const auction = auctions[roomCode];
      if (!auction) return;
      auction.paused = !auction.paused;
      if (auction.paused) clearTimer(roomCode);
      io.to(roomCode).emit('pause-update', { paused: auction.paused });
    });

    socket.on('toggle-show-teams', ({ roomCode, show }) => {
      io.to(roomCode).emit('show-teams-update', { show });
    });

    socket.on('disconnect', () => console.log('Disconnected:', socket.id));
  });
}

function emitCurrentPlayer(io, roomCode) {
  const auction = auctions[roomCode];
  const player = auction.players[auction.currentIdx];
  if (!player) return;

  auction.currentBid = null;
  auction.currentBidder = null;

  io.to(roomCode).emit('current-player', {
    player,
    setName: SET_NAMES[player.set],
    setNumber: player.set,
    playerIndex: auction.currentIdx,
    totalPlayers: auction.players.length,
    basePrice: player.basePrice,
    nextBid: player.basePrice,
    isOverseas: isOverseas(player.nationality),
  });
}

async function sellCurrentPlayer(io, roomCode) {
  const auction = auctions[roomCode];
  if (!auction || !auction.currentBidder) return;

  const player = auction.players[auction.currentIdx];
  clearTimer(roomCode);

  await prisma.soldPlayer.create({
    data: { playerId: player.id, teamId: auction.currentBidder, roomId: auction.roomId, soldPrice: auction.currentBid }
  });
  await prisma.team.update({
    where: { id: auction.currentBidder },
    data: { purse: { decrement: auction.currentBid } }
  });

  const team = await prisma.team.findUnique({
    where: { id: auction.currentBidder },
    include: { soldPlayers: { include: { player: true } } }
  });

  const overseasCount = team.soldPlayers.filter(sp => isOverseas(sp.player.nationality)).length;

  io.to(roomCode).emit('player-sold', {
    player,
    soldPrice: auction.currentBid,
    teamId: auction.currentBidder,
    teamName: team.name,
    remainingPurse: team.purse,
    squadSize: team.soldPlayers.length,
    overseasCount,
  });
}

async function markUnsold(io, roomCode) {
  const auction = auctions[roomCode];
  if (!auction) return;
  const player = auction.players[auction.currentIdx];
  clearTimer(roomCode);
  auction.unsold.push(player);
  io.to(roomCode).emit('player-unsold', { player });
}

function resetTimer(io, roomCode) {
  clearTimer(roomCode);
  const auction = auctions[roomCode];
  if (!auction) return;

  auction.timerSeconds = 10;
  io.to(roomCode).emit('timer-update', { seconds: auction.timerSeconds });

  timers[roomCode] = setInterval(() => {
    auction.timerSeconds--;
    io.to(roomCode).emit('timer-update', { seconds: auction.timerSeconds });
    if (auction.timerSeconds <= 0) {
      clearTimer(roomCode);
      if (auction.currentBid && auction.currentBidder) {
        sellCurrentPlayer(io, roomCode);
      } else {
        io.to(roomCode).emit('timer-expired');
      }
    }
  }, 1000);
}

function clearTimer(roomCode) {
  if (timers[roomCode]) { clearInterval(timers[roomCode]); delete timers[roomCode]; }
}

module.exports = { setupSocket };
