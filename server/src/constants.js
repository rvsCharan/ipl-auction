const FRANCHISES = [
  { name: 'CSK', fullName: 'Chennai Super Kings', color: '#FFCB05' },
  { name: 'MI', fullName: 'Mumbai Indians', color: '#004BA0' },
  { name: 'RCB', fullName: 'Royal Challengers Bengaluru', color: '#EC1C24' },
  { name: 'KKR', fullName: 'Kolkata Knight Riders', color: '#3A225D' },
  { name: 'DC', fullName: 'Delhi Capitals', color: '#004C93' },
  { name: 'PBKS', fullName: 'Punjab Kings', color: '#DD1F2D' },
  { name: 'RR', fullName: 'Rajasthan Royals', color: '#EA1A85' },
  { name: 'SRH', fullName: 'Sunrisers Hyderabad', color: '#FF822A' },
  { name: 'GT', fullName: 'Gujarat Titans', color: '#1C1C1C' },
  { name: 'LSG', fullName: 'Lucknow Super Giants', color: '#A72056' },
];

const SET_NAMES = {
  1: 'Marquee Players',
  2: 'Capped Indian Batters',
  3: 'Capped Overseas Batters',
  4: 'Capped Indian All-rounders',
  5: 'Capped Overseas All-rounders',
  6: 'Capped Indian Fast Bowlers',
  7: 'Capped Overseas Fast Bowlers',
  8: 'Capped Spinners',
  9: 'Capped Wicketkeepers',
  10: 'Uncapped Indian Batters - 1',
  11: 'Uncapped Indian All-rounders - 1',
  12: 'Uncapped Indian Fast Bowlers - 1',
  13: 'Uncapped Indian Spinners',
  14: 'Uncapped Overseas Batters - 1',
  15: 'Uncapped Overseas Bowlers & All-rounders - 1',
  16: 'Uncapped Indian Fast Bowlers - 2',
  17: 'Uncapped Indian Batters - 2',
  18: 'Uncapped Indian All-rounders - 2',
  19: 'Uncapped Overseas Batters - 2',
  20: 'Uncapped Overseas Bowlers - 2',
};

// Real IPL auction bid increments
// Up to 1 Cr: +5L increments
// 1 Cr to 2 Cr: +10L increments
// 2 Cr to 5 Cr: +20L increments
// 5 Cr to 10 Cr: +25L increments
// Above 10 Cr: +50L increments
function getNextBid(currentBid) {
  if (currentBid < 100) return currentBid + 5;
  if (currentBid < 200) return currentBid + 10;
  if (currentBid < 500) return currentBid + 20;
  if (currentBid < 1000) return currentBid + 25;
  return currentBid + 50;
}

// Real IPL squad rules
const SQUAD_RULES = {
  MAX_SQUAD_SIZE: 25,       // max 25 players per team
  MIN_SQUAD_SIZE: 18,       // min 18 players
  MAX_OVERSEAS: 8,          // max 8 overseas players
  PURSE: 12000,             // ₹120 Cr in lakhs
};

function isOverseas(nationality) {
  return nationality !== 'IND';
}

module.exports = { FRANCHISES, SET_NAMES, getNextBid, SQUAD_RULES, isOverseas };
