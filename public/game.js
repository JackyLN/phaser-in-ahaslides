const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: false,
    },
  },
  scene: {
    preload: preload,
    create: create,
    update: update,
  },
  parent: 'game-container',
};

const game = new Phaser.Game(config);

let players = {};
let socket;

function preload() {
  this.load.spritesheet('player', './p3.png', {
    frameWidth: 32, // Width of each frame
    frameHeight: 32, // Height of each frame
  });
  this.load.image('background', 'path/to/background.png');
}

function create() {
  const self = this;

  this.add.image(400, 300, 'background');

  socket = io();

  socket.on('currentPlayers', (serverPlayers) => {
    Object.keys(serverPlayers).forEach((id) => {
      if (serverPlayers[id].id !== socket.id) {
        addOtherPlayer(self, serverPlayers[id]);
      }
    });
  });

  socket.on('newPlayer', (playerInfo) => {
    addOtherPlayer(self, playerInfo);
  });

  socket.on('playerDisconnected', (id) => {
    if (players[id]) {
      players[id].destroy();
      delete players[id];
    }
  });

  socket.emit('newPlayer', {});
  socket.on('yourPlayer', (playerInfo) => {
    addYourPlayer(self, playerInfo);
  });

  socket.on('playerMoved', (playerInfo) => {
    if (players[playerInfo.id]) {
      players[playerInfo.id].setPosition(playerInfo.x, playerInfo.y);
    }
  });

  this.cursors = this.input.keyboard.createCursorKeys();
}

function update() {
  const player = players[socket.id];

  if (player) {
    let moved = false;
    if (this.cursors.left.isDown) {
      player.x -= 5;
      moved = true;
    } else if (this.cursors.right.isDown) {
      player.x += 5;
      moved = true;
    }
    if (this.cursors.up.isDown) {
      player.y -= 5;
      moved = true;
    } else if (this.cursors.down.isDown) {
      player.y += 5;
      moved = true;
    }

    if (moved) {
      socket.emit('playerMovement', { x: player.x, y: player.y });
    }
  }
}

function addYourPlayer(self, playerInfo) {
  players[playerInfo.id] = self.physics.add.image(playerInfo.x, playerInfo.y, 'player');
}

function addOtherPlayer(self, playerInfo) {
  players[playerInfo.id] = self.add.image(playerInfo.x, playerInfo.y, 'player');
}
