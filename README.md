# 🏏 IPL Auction Simulator

Multiplayer IPL mega auction game. One person hosts as auctioneer, others join as team owners and bid in real-time.

## Setup

### 1. Clone & Install
```bash
git clone https://github.com/rvsCharan/ipl-auction.git
cd ipl-auction
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Create env files

**server/.env**
```
DATABASE_URL="your_postgresql_connection_url"
```

**client/.env**
```
VITE_SERVER_URL=http://localhost:3000
```

### 3. Setup database
```bash
cd server
npx prisma db push
node prisma/seed.js
```

### 4. Run
```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Open **http://localhost:5173**

## How to Play
1. Host creates a room (becomes auctioneer)
2. Friends join with room code and pick a franchise
3. Host starts auction
4. Players bid in real-time, timer counts down
5. Auto-sold when timer expires with a bid
6. Host can mark unsold or skip

## Rules (Real IPL)
- ₹120 Cr purse per team
- Max 25 players, max 8 overseas
- Bid increments: +5L (up to 1Cr), +10L (1-2Cr), +20L (2-5Cr), +25L (5-10Cr), +50L (10Cr+)
