const router = require('express').Router();
const prisma = require('../db');
const { FRANCHISES } = require('../constants');

// Create room
router.post('/', async (req, res) => {
  const { hostName } = req.body;
  const code = Math.random().toString(36).substring(2, 8).toUpperCase();
  const room = await prisma.room.create({ data: { code, hostName }, include: { teams: true } });
  res.json({ room, franchises: FRANCHISES });
});

// Join room
router.post('/:code/join', async (req, res) => {
  const { code } = req.params;
  const { ownerName, franchise } = req.body;
  const room = await prisma.room.findUnique({ where: { code }, include: { teams: true } });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  if (room.status !== 'lobby') return res.status(400).json({ error: 'Auction already started' });
  if (room.teams.length >= room.maxTeams) return res.status(400).json({ error: 'Room full' });
  if (room.teams.some(t => t.name === franchise)) return res.status(400).json({ error: 'Franchise taken' });

  const team = await prisma.team.create({
    data: { name: franchise, ownerName, purse: room.purse, roomId: room.id }
  });
  res.json({ team, room });
});

// Get room state
router.get('/:code', async (req, res) => {
  const room = await prisma.room.findUnique({
    where: { code: req.params.code },
    include: { teams: { include: { soldPlayers: { include: { player: true } } } }, soldPlayers: { include: { player: true, team: true } } }
  });
  if (!room) return res.status(404).json({ error: 'Room not found' });
  res.json(room);
});

module.exports = router;
