// Import necessary modules
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the public directory
app.use(express.static('public'));

// Start the server
const PORT = 3000;
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

// Game state
const players = {};

// Socket.IO logic
io.on('connection', (socket) => {
  console.log('A player connected:', socket.id);

  // Initialize the player
  players[socket.id] = { id: socket.id, x: Math.random() * 800, y: Math.random() * 600 };

  // Send current players to the newly connected player
  socket.emit('currentPlayers', players);
  socket.emit('yourPlayer', players[socket.id]);

  // Notify others about the new player
  socket.broadcast.emit('newPlayer', players[socket.id]);

  // Handle player movement
  socket.on('playerMovement', (movement) => {
    if (players[socket.id]) {
      players[socket.id].x = movement.x;
      players[socket.id].y = movement.y;
      // Notify other players of the movement
      socket.broadcast.emit('playerMoved', players[socket.id]);
    }
  });

  // Handle disconnection
  socket.on('disconnecting', () => {
    console.log('Player disconnected:', socket.id);
    delete players[socket.id];
    // Notify others that the player has disconnected
    socket.broadcast.emit('playerDisconnected', socket.id);
  });
});
