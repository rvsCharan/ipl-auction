const router = require('express').Router();
const prisma = require('../db');
const { SET_NAMES } = require('../constants');

// Get all players grouped by set
router.get('/', async (req, res) => {
  const players = await prisma.player.findMany({ orderBy: [{ set: 'asc' }, { basePrice: 'desc' }] });
  const sets = {};
  players.forEach(p => {
    if (!sets[p.set]) sets[p.set] = { name: SET_NAMES[p.set], players: [] };
    sets[p.set].players.push(p);
  });
  res.json(sets);
});

module.exports = router;
