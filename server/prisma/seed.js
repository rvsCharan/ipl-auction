const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const { set1, set2, set3, set4, set5 } = require('./players-part1');
const p2 = require('./players-part2');
const p3 = require('./players-part3');

// Stats lookup for notable players in part2/part3
const statsMap = {
  "Mohammed Shami": { lastTeam: "GT", matches: 101, runs: 52, wickets: 120, economy: 8.0 },
  "Mohammed Siraj": { lastTeam: "RCB", matches: 74, runs: 28, wickets: 78, economy: 8.72 },
  "Arshdeep Singh": { lastTeam: "PBKS", matches: 65, runs: 15, wickets: 76, economy: 9.14 },
  "Bhuvneshwar Kumar": { lastTeam: "SRH", matches: 170, runs: 168, wickets: 181, economy: 7.34 },
  "Prasidh Krishna": { lastTeam: "RR", matches: 30, runs: 12, wickets: 34, economy: 9.0 },
  "Deepak Chahar": { lastTeam: "CSK", matches: 72, runs: 186, wickets: 78, economy: 7.8 },
  "T Natarajan": { lastTeam: "SRH", matches: 38, runs: 10, wickets: 44, economy: 8.5 },
  "Umesh Yadav": { lastTeam: "KKR", matches: 136, runs: 167, wickets: 136, economy: 8.54 },
  "Umran Malik": { lastTeam: "SRH", matches: 24, runs: 8, wickets: 22, economy: 9.5 },
  "Avesh Khan": { lastTeam: "LSG", matches: 52, runs: 30, wickets: 55, economy: 8.9 },
  "Mukesh Kumar": { lastTeam: "DC", matches: 22, runs: 5, wickets: 20, economy: 9.2 },
  "Trent Boult": { lastTeam: "RR", matches: 78, runs: 40, wickets: 89, economy: 8.0 },
  "Josh Hazlewood": { lastTeam: "RCB", matches: 32, runs: 15, wickets: 37, economy: 8.1 },
  "Anrich Nortje": { lastTeam: "DC", matches: 40, runs: 10, wickets: 48, economy: 7.6 },
  "Lockie Ferguson": { lastTeam: "KKR", matches: 30, runs: 8, wickets: 37, economy: 8.3 },
  "Mark Wood": { lastTeam: "LSG", matches: 12, runs: 5, wickets: 15, economy: 8.5 },
  "Jofra Archer": { lastTeam: "MI", matches: 35, runs: 113, wickets: 46, economy: 7.13 },
  "Alzarri Joseph": { lastTeam: "GT", matches: 30, runs: 45, wickets: 35, economy: 9.0 },
  "Mustafizur Rahman": { lastTeam: "CSK", matches: 30, runs: 10, wickets: 28, economy: 8.2 },
  "Yuzvendra Chahal": { lastTeam: "RR", matches: 142, runs: 72, wickets: 187, economy: 7.59 },
  "Kuldeep Yadav": { lastTeam: "DC", matches: 75, runs: 82, wickets: 83, economy: 8.0 },
  "R Ashwin": { lastTeam: "RR", matches: 193, runs: 666, wickets: 180, economy: 6.79 },
  "Ravi Bishnoi": { lastTeam: "LSG", matches: 42, runs: 10, wickets: 42, economy: 7.8 },
  "Varun Chakravarthy": { lastTeam: "KKR", matches: 50, runs: 15, wickets: 52, economy: 7.2 },
  "Adam Zampa": { lastTeam: "RR", matches: 12, runs: 5, wickets: 10, economy: 8.0 },
  "Tabraiz Shamsi": { lastTeam: "DC", matches: 8, runs: 2, wickets: 6, economy: 8.5 },
  "Maheesh Theekshana": { lastTeam: "CSK", matches: 22, runs: 15, wickets: 20, economy: 7.3 },
  "Dinesh Karthik": { lastTeam: "RCB", matches: 257, runs: 4842, wickets: 0, strikeRate: 138.35, average: 26.32 },
  "Nicholas Pooran": { lastTeam: "LSG", matches: 44, runs: 1072, wickets: 0, strikeRate: 152.27, average: 26.8 },
  "Tilak Varma": { lastTeam: "MI", matches: 30, runs: 987, wickets: 0, strikeRate: 143.48, average: 35.25 },
  "Rinku Singh": { lastTeam: "KKR", matches: 40, runs: 938, wickets: 0, strikeRate: 149.52, average: 36.08 },
  "Nitish Kumar Reddy": { lastTeam: "SRH", matches: 14, runs: 303, wickets: 3, strikeRate: 142.92, average: 25.25, economy: 9.5 },
  "Harshit Rana": { lastTeam: "KKR", matches: 14, runs: 20, wickets: 19, economy: 9.3 },
  "Mayank Yadav": { lastTeam: "LSG", matches: 4, runs: 0, wickets: 6, economy: 6.5 },
  "Abhishek Sharma": { lastTeam: "SRH", matches: 42, runs: 1025, wickets: 5, strikeRate: 163.64, average: 26.28 },
  "Riyan Parag": { lastTeam: "RR", matches: 60, runs: 1252, wickets: 5, strikeRate: 139.11, average: 24.55 },
  "Shivam Dube": { lastTeam: "CSK", matches: 72, runs: 1504, wickets: 8, strikeRate: 140.15, average: 25.07 },
  "Tim David": { lastTeam: "MI", matches: 28, runs: 484, wickets: 0, strikeRate: 158.03, average: 24.2 },
  "Gerald Coetzee": { lastTeam: "MI", matches: 7, runs: 20, wickets: 10, economy: 10.2 },
  "Spencer Johnson": { lastTeam: "GT", matches: 10, runs: 5, wickets: 12, economy: 9.0 },
  "Will Jacks": { lastTeam: "RCB", matches: 7, runs: 150, wickets: 3, strikeRate: 175.44, average: 21.43, economy: 8.5 },
  "Jake Fraser-McGurk": { lastTeam: "DC", matches: 7, runs: 210, wickets: 0, strikeRate: 234.83, average: 30.0 },
  "Matheesha Pathirana": { lastTeam: "CSK", matches: 18, runs: 5, wickets: 22, economy: 8.1 },
  "Fazalhaq Farooqi": { lastTeam: "SRH", matches: 14, runs: 5, wickets: 18, economy: 8.3 },
  "Dewald Brevis": { lastTeam: "MI", matches: 14, runs: 218, wickets: 0, strikeRate: 142.48, average: 16.77 },
  "Shimron Hetmyer": { lastTeam: "RR", matches: 55, runs: 1083, wickets: 0, strikeRate: 159.56, average: 30.08 },
  "Sarfaraz Khan": { lastTeam: "DC", matches: 5, runs: 45, wickets: 0, strikeRate: 112.5, average: 11.25 },
  "Sai Sudharsan": { lastTeam: "GT", matches: 28, runs: 756, wickets: 0, strikeRate: 131.25, average: 30.24 },
  "Rahmanullah Gurbaz": { lastTeam: "KKR", matches: 14, runs: 426, wickets: 0, strikeRate: 155.47, average: 30.43 },
};

// Add defaults + stats to all players
const enrich = (arr) => arr.map(p => ({
  ...p,
  lastTeam: statsMap[p.name]?.lastTeam || p.lastTeam || '-',
  matches: statsMap[p.name]?.matches || p.matches || 0,
  runs: statsMap[p.name]?.runs || p.runs || 0,
  wickets: statsMap[p.name]?.wickets || p.wickets || 0,
  strikeRate: statsMap[p.name]?.strikeRate || p.strikeRate || 0,
  economy: statsMap[p.name]?.economy || p.economy || 0,
  average: statsMap[p.name]?.average || p.average || 0,
}));

const allPlayers = [
  ...set1, ...set2, ...set3, ...set4, ...set5,
  ...enrich(p2.set6), ...enrich(p2.set7), ...enrich(p2.set8), ...enrich(p2.set9),
  ...enrich(p3.set10), ...enrich(p3.set11), ...enrich(p3.set12), ...enrich(p3.set13), ...enrich(p3.set14), ...enrich(p3.set15),
];

async function main() {
  await prisma.soldPlayer.deleteMany();
  await prisma.team.deleteMany();
  await prisma.room.deleteMany();
  await prisma.player.deleteMany();
  await prisma.player.createMany({ data: allPlayers });
  console.log(`Seeded ${allPlayers.length} players with IPL career stats`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
