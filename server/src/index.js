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

const isProd = process.env.NODE_ENV === 'production';

const io = new Server(server, {
  cors: { origin: isProd ? '*' : 'http://localhost:5173', methods: ['GET', 'POST'] }
});

app.use(cors());
app.use(express.json());

app.use('/api/rooms', roomRoutes);
app.use('/api/players', playerRoutes);

// Serve frontend in production
if (isProd) {
  app.use(express.static(path.join(__dirname, '../../client/dist')));
  app.get('*', (_, res) => res.sendFile(path.join(__dirname, '../../client/dist/index.html')));
}

setupSocket(io);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
