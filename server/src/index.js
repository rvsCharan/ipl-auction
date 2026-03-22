const express = require('express');
const { createServer } = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const path = require('path');
const roomRoutes = require('./routes/rooms');
const playerRoutes = require('./routes/players');
const { setupSocket } = require('./socket/auction');

const app = express();
const server = createServer(app);

const io = new Server(server, {
  cors: { origin: process.env.CLIENT_URL || 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

// API routes
app.use('/api/rooms', roomRoutes);
app.use('/api/players', playerRoutes);

// Serve static frontend in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../../client/dist/index.html')));
}

// Socket.IO
setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
