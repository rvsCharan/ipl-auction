const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Stats: matches, runs, wickets, strikeRate, economy, average, lastTeam
const set1 = [
  { name: "Virat Kohli", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 1, lastTeam: "RCB", matches: 252, runs: 8004, wickets: 4, strikeRate: 131.97, average: 38.48, economy: 0 },
  { name: "Rohit Sharma", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 1, lastTeam: "MI", matches: 257, runs: 6628, wickets: 15, strikeRate: 130.39, average: 29.21, economy: 0 },
  { name: "Jasprit Bumrah", role: "BOWL", nationality: "IND", isCapped: true, basePrice: 200, set: 1, lastTeam: "MI", matches: 133, runs: 56, wickets: 165, strikeRate: 0, average: 0, economy: 7.39 },
  { name: "Rishabh Pant", role: "WK", nationality: "IND", isCapped: true, basePrice: 200, set: 1, lastTeam: "DC", matches: 111, runs: 3284, wickets: 0, strikeRate: 148.72, average: 35.31, economy: 0 },
  { name: "KL Rahul", role: "WK", nationality: "IND", isCapped: true, basePrice: 200, set: 1, lastTeam: "LSG", matches: 132, runs: 4683, wickets: 0, strikeRate: 134.61, average: 39.01, economy: 0 },
  { name: "Suryakumar Yadav", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 1, lastTeam: "MI", matches: 115, runs: 2840, wickets: 1, strikeRate: 147.32, average: 28.97, economy: 0 },
  { name: "Mitchell Starc", role: "BOWL", nationality: "AUS", isCapped: true, basePrice: 200, set: 1, lastTeam: "KKR", matches: 42, runs: 108, wickets: 51, strikeRate: 0, average: 0, economy: 8.22 },
  { name: "Pat Cummins", role: "BOWL", nationality: "AUS", isCapped: true, basePrice: 200, set: 1, lastTeam: "SRH", matches: 49, runs: 374, wickets: 46, strikeRate: 142.75, average: 0, economy: 8.69 },
  { name: "Jos Buttler", role: "WK", nationality: "ENG", isCapped: true, basePrice: 200, set: 1, lastTeam: "RR", matches: 107, runs: 3478, wickets: 0, strikeRate: 150.54, average: 38.64, economy: 0 },
  { name: "Rashid Khan", role: "BOWL", nationality: "AFG", isCapped: true, basePrice: 200, set: 1, lastTeam: "GT", matches: 109, runs: 381, wickets: 112, strikeRate: 148.24, average: 0, economy: 6.73 },
  { name: "Kagiso Rabada", role: "BOWL", nationality: "SA", isCapped: true, basePrice: 200, set: 1, lastTeam: "PBKS", matches: 63, runs: 73, wickets: 84, strikeRate: 0, average: 0, economy: 8.21 },
  { name: "Heinrich Klaasen", role: "WK", nationality: "SA", isCapped: true, basePrice: 200, set: 1, lastTeam: "SRH", matches: 32, runs: 1024, wickets: 0, strikeRate: 171.62, average: 37.93, economy: 0 },
];

const set2 = [
  { name: "Shubman Gill", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 2, lastTeam: "GT", matches: 79, runs: 2544, wickets: 0, strikeRate: 133.47, average: 35.33, economy: 0 },
  { name: "Yashasvi Jaiswal", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 2, lastTeam: "RR", matches: 42, runs: 1632, wickets: 0, strikeRate: 155.43, average: 40.8, economy: 0 },
  { name: "Shreyas Iyer", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 2, lastTeam: "KKR", matches: 115, runs: 3127, wickets: 2, strikeRate: 127.38, average: 32.57, economy: 0 },
  { name: "Ruturaj Gaikwad", role: "BAT", nationality: "IND", isCapped: true, basePrice: 200, set: 2, lastTeam: "CSK", matches: 62, runs: 2108, wickets: 0, strikeRate: 136.34, average: 37.64, economy: 0 },
  { name: "Sanju Samson", role: "WK", nationality: "IND", isCapped: true, basePrice: 200, set: 2, lastTeam: "RR", matches: 162, runs: 4141, wickets: 0, strikeRate: 136.77, average: 29.16, economy: 0 },
  { name: "Ishan Kishan", role: "WK", nationality: "IND", isCapped: true, basePrice: 200, set: 2, lastTeam: "MI", matches: 89, runs: 2325, wickets: 0, strikeRate: 136.03, average: 28.01, economy: 0 },
  { name: "Devdutt Padikkal", role: "BAT", nationality: "IND", isCapped: true, basePrice: 100, set: 2, lastTeam: "RCB", matches: 63, runs: 1502, wickets: 0, strikeRate: 127.14, average: 25.46, economy: 0 },
  { name: "Prithvi Shaw", role: "BAT", nationality: "IND", isCapped: true, basePrice: 75, set: 2, lastTeam: "DC", matches: 63, runs: 1588, wickets: 0, strikeRate: 147.17, average: 25.61, economy: 0 },
  { name: "Manish Pandey", role: "BAT", nationality: "IND", isCapped: true, basePrice: 75, set: 2, lastTeam: "SRH", matches: 173, runs: 3942, wickets: 0, strikeRate: 121.33, average: 29.42, economy: 0 },
  { name: "Mayank Agarwal", role: "BAT", nationality: "IND", isCapped: true, basePrice: 100, set: 2, lastTeam: "PBKS", matches: 107, runs: 2686, wickets: 0, strikeRate: 135.82, average: 22.38, economy: 0 },
  { name: "Ajinkya Rahane", role: "BAT", nationality: "IND", isCapped: true, basePrice: 50, set: 2, lastTeam: "CSK", matches: 180, runs: 4195, wickets: 0, strikeRate: 122.44, average: 28.48, economy: 0 },
  { name: "Robin Uthappa", role: "BAT", nationality: "IND", isCapped: true, basePrice: 50, set: 2, lastTeam: "CSK", matches: 205, runs: 4952, wickets: 5, strikeRate: 130.35, average: 27.51, economy: 0 },
];

const set3 = [
  { name: "David Warner", role: "BAT", nationality: "AUS", isCapped: true, basePrice: 200, set: 3, lastTeam: "DC", matches: 176, runs: 6565, wickets: 2, strikeRate: 139.96, average: 41.55, economy: 0 },
  { name: "Faf du Plessis", role: "BAT", nationality: "SA", isCapped: true, basePrice: 150, set: 3, lastTeam: "RCB", matches: 145, runs: 4571, wickets: 0, strikeRate: 133.92, average: 34.63, economy: 0 },
  { name: "Travis Head", role: "BAT", nationality: "AUS", isCapped: true, basePrice: 150, set: 3, lastTeam: "SRH", matches: 28, runs: 567, wickets: 3, strikeRate: 153.93, average: 25.77, economy: 0 },
  { name: "Harry Brook", role: "BAT", nationality: "ENG", isCapped: true, basePrice: 150, set: 3, lastTeam: "SRH", matches: 14, runs: 190, wickets: 0, strikeRate: 131.94, average: 15.83, economy: 0 },
  { name: "Quinton de Kock", role: "WK", nationality: "SA", isCapped: true, basePrice: 150, set: 3, lastTeam: "LSG", matches: 104, runs: 3157, wickets: 0, strikeRate: 137.35, average: 32.55, economy: 0 },
  { name: "Jonny Bairstow", role: "WK", nationality: "ENG", isCapped: true, basePrice: 150, set: 3, lastTeam: "PBKS", matches: 48, runs: 1350, wickets: 0, strikeRate: 141.88, average: 30.68, economy: 0 },
  { name: "Phil Salt", role: "WK", nationality: "ENG", isCapped: true, basePrice: 150, set: 3, lastTeam: "DC", matches: 20, runs: 435, wickets: 0, strikeRate: 158.76, average: 24.17, economy: 0 },
  { name: "Devon Conway", role: "BAT", nationality: "NZ", isCapped: true, basePrice: 100, set: 3, lastTeam: "CSK", matches: 30, runs: 672, wickets: 0, strikeRate: 127.27, average: 26.88, economy: 0 },
  { name: "Aiden Markram", role: "BAT", nationality: "SA", isCapped: true, basePrice: 100, set: 3, lastTeam: "SRH", matches: 30, runs: 616, wickets: 5, strikeRate: 128.33, average: 22.81, economy: 0 },
  { name: "Rachin Ravindra", role: "ALL", nationality: "NZ", isCapped: true, basePrice: 100, set: 3, lastTeam: "CSK", matches: 14, runs: 222, wickets: 3, strikeRate: 130.59, average: 18.5, economy: 7.5 },
  { name: "Steve Smith", role: "BAT", nationality: "AUS", isCapped: true, basePrice: 150, set: 3, lastTeam: "DC", matches: 114, runs: 2795, wickets: 1, strikeRate: 128.73, average: 34.94, economy: 0 },
  { name: "Kane Williamson", role: "BAT", nationality: "NZ", isCapped: true, basePrice: 150, set: 3, lastTeam: "GT", matches: 76, runs: 2225, wickets: 0, strikeRate: 120.76, average: 36.48, economy: 0 },
  { name: "Glenn Phillips", role: "BAT", nationality: "NZ", isCapped: true, basePrice: 100, set: 3, lastTeam: "SRH", matches: 8, runs: 95, wickets: 2, strikeRate: 131.94, average: 13.57, economy: 8.0 },
  { name: "Finn Allen", role: "BAT", nationality: "NZ", isCapped: true, basePrice: 100, set: 3, lastTeam: "RCB", matches: 10, runs: 195, wickets: 0, strikeRate: 172.57, average: 21.67, economy: 0 },
  { name: "Rilee Rossouw", role: "BAT", nationality: "SA", isCapped: true, basePrice: 100, set: 3, lastTeam: "SRH", matches: 10, runs: 288, wickets: 0, strikeRate: 168.42, average: 32.0, economy: 0 },
  { name: "Ben Duckett", role: "BAT", nationality: "ENG", isCapped: true, basePrice: 100, set: 3, lastTeam: "-", matches: 0, runs: 0, wickets: 0, strikeRate: 0, average: 0, economy: 0 },
  { name: "Pathum Nissanka", role: "BAT", nationality: "SL", isCapped: true, basePrice: 100, set: 3, lastTeam: "-", matches: 0, runs: 0, wickets: 0, strikeRate: 0, average: 0, economy: 0 },
  { name: "Ryan Rickelton", role: "BAT", nationality: "SA", isCapped: true, basePrice: 100, set: 3, lastTeam: "-", matches: 0, runs: 0, wickets: 0, strikeRate: 0, average: 0, economy: 0 },
];

const set4 = [
  { name: "Hardik Pandya", role: "ALL", nationality: "IND", isCapped: true, basePrice: 200, set: 4, lastTeam: "MI", matches: 120, runs: 2340, wickets: 60, strikeRate: 147.49, average: 27.53, economy: 9.06 },
  { name: "Ravindra Jadeja", role: "ALL", nationality: "IND", isCapped: true, basePrice: 200, set: 4, lastTeam: "CSK", matches: 226, runs: 2692, wickets: 152, strikeRate: 127.71, average: 26.39, economy: 7.6 },
  { name: "Axar Patel", role: "ALL", nationality: "IND", isCapped: true, basePrice: 150, set: 4, lastTeam: "DC", matches: 100, runs: 1024, wickets: 82, strikeRate: 131.79, average: 19.32, economy: 7.31 },
  { name: "Washington Sundar", role: "ALL", nationality: "IND", isCapped: true, basePrice: 100, set: 4, lastTeam: "SRH", matches: 62, runs: 476, wickets: 47, strikeRate: 120.1, average: 17.63, economy: 6.96 },
  { name: "Venkatesh Iyer", role: "ALL", nationality: "IND", isCapped: true, basePrice: 100, set: 4, lastTeam: "KKR", matches: 50, runs: 1154, wickets: 8, strikeRate: 131.97, average: 27.48, economy: 9.5 },
  { name: "Krunal Pandya", role: "ALL", nationality: "IND", isCapped: true, basePrice: 75, set: 4, lastTeam: "LSG", matches: 109, runs: 1327, wickets: 67, strikeRate: 127.43, average: 22.12, economy: 7.47 },
  { name: "Deepak Hooda", role: "ALL", nationality: "IND", isCapped: true, basePrice: 75, set: 4, lastTeam: "LSG", matches: 92, runs: 1285, wickets: 10, strikeRate: 131.63, average: 20.08, economy: 8.0 },
  { name: "Vijay Shankar", role: "ALL", nationality: "IND", isCapped: true, basePrice: 50, set: 4, lastTeam: "GT", matches: 71, runs: 862, wickets: 14, strikeRate: 121.52, average: 21.55, economy: 8.75 },
  { name: "Rahul Tewatia", role: "ALL", nationality: "IND", isCapped: true, basePrice: 75, set: 4, lastTeam: "GT", matches: 93, runs: 1258, wickets: 30, strikeRate: 138.41, average: 24.19, economy: 8.5 },
  { name: "Shardul Thakur", role: "ALL", nationality: "IND", isCapped: true, basePrice: 100, set: 4, lastTeam: "KKR", matches: 93, runs: 476, wickets: 89, strikeRate: 131.49, average: 14.42, economy: 8.86 },
];

const set5 = [
  { name: "Glenn Maxwell", role: "ALL", nationality: "AUS", isCapped: true, basePrice: 200, set: 5, lastTeam: "RCB", matches: 122, runs: 2818, wickets: 27, strikeRate: 155.72, average: 26.58, economy: 8.0 },
  { name: "Marcus Stoinis", role: "ALL", nationality: "AUS", isCapped: true, basePrice: 150, set: 5, lastTeam: "LSG", matches: 79, runs: 1370, wickets: 28, strikeRate: 136.32, average: 24.46, economy: 9.1 },
  { name: "Liam Livingstone", role: "ALL", nationality: "ENG", isCapped: true, basePrice: 150, set: 5, lastTeam: "PBKS", matches: 35, runs: 710, wickets: 10, strikeRate: 147.61, average: 23.67, economy: 8.5 },
  { name: "Sam Curran", role: "ALL", nationality: "ENG", isCapped: true, basePrice: 150, set: 5, lastTeam: "PBKS", matches: 55, runs: 499, wickets: 52, strikeRate: 137.47, average: 17.21, economy: 8.82 },
  { name: "Cameron Green", role: "ALL", nationality: "AUS", isCapped: true, basePrice: 150, set: 5, lastTeam: "MI", matches: 14, runs: 452, wickets: 4, strikeRate: 153.74, average: 37.67, economy: 9.5 },
  { name: "Mitchell Marsh", role: "ALL", nationality: "AUS", isCapped: true, basePrice: 150, set: 5, lastTeam: "DC", matches: 35, runs: 567, wickets: 12, strikeRate: 133.73, average: 21.81, economy: 8.5 },
  { name: "Moeen Ali", role: "ALL", nationality: "ENG", isCapped: true, basePrice: 100, set: 5, lastTeam: "CSK", matches: 67, runs: 1302, wickets: 36, strikeRate: 137.34, average: 23.25, economy: 7.5 },
  { name: "Wanindu Hasaranga", role: "ALL", nationality: "SL", isCapped: true, basePrice: 150, set: 5, lastTeam: "RCB", matches: 20, runs: 119, wickets: 26, strikeRate: 119.0, average: 0, economy: 7.88 },
  { name: "Sunil Narine", role: "ALL", nationality: "WI", isCapped: true, basePrice: 200, set: 5, lastTeam: "KKR", matches: 177, runs: 2464, wickets: 163, strikeRate: 162.78, average: 19.71, economy: 6.67 },
  { name: "Andre Russell", role: "ALL", nationality: "WI", isCapped: true, basePrice: 200, set: 5, lastTeam: "KKR", matches: 118, runs: 2510, wickets: 89, strikeRate: 177.88, average: 28.52, economy: 9.29 },
  { name: "Shakib Al Hasan", role: "ALL", nationality: "BAN", isCapped: true, basePrice: 150, set: 5, lastTeam: "KKR", matches: 71, runs: 793, wickets: 63, strikeRate: 118.24, average: 17.62, economy: 7.3 },
  { name: "Jason Holder", role: "ALL", nationality: "WI", isCapped: true, basePrice: 100, set: 5, lastTeam: "RR", matches: 47, runs: 348, wickets: 52, strikeRate: 128.89, average: 17.4, economy: 8.73 },
  { name: "Daryl Mitchell", role: "ALL", nationality: "NZ", isCapped: true, basePrice: 100, set: 5, lastTeam: "-", matches: 5, runs: 48, wickets: 1, strikeRate: 120.0, average: 12.0, economy: 9.0 },
  { name: "Marco Jansen", role: "ALL", nationality: "SA", isCapped: true, basePrice: 100, set: 5, lastTeam: "SRH", matches: 22, runs: 178, wickets: 22, strikeRate: 148.33, average: 0, economy: 9.2 },
  { name: "Romario Shepherd", role: "ALL", nationality: "WI", isCapped: true, basePrice: 75, set: 5, lastTeam: "LSG", matches: 18, runs: 155, wickets: 12, strikeRate: 155.0, average: 19.38, economy: 9.5 },
  { name: "Mitchell Santner", role: "ALL", nationality: "NZ", isCapped: true, basePrice: 100, set: 5, lastTeam: "CSK", matches: 27, runs: 152, wickets: 18, strikeRate: 112.59, average: 0, economy: 7.1 },
];

module.exports = { set1, set2, set3, set4, set5 };
