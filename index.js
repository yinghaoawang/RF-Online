const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

const PlayerNumber = {
   ONE: 1,
   TWO: 2
}

app.use('/', express.static('public'));

let player1 = null;
let player2 = null;

io.on('connection', function(socket) {
   console.log('A user connected');

   socket.on('playerData', ({ playerNumber, playerData }) => {
      if (player1 == null) {
         console.error('Null server player in playerData');
         return;
      }

      if (playerData == null) {
         console.error('Null client player data in playerData');
         return;
      }

      switch (playerNumber) {
         case PlayerNumber.ONE:
            const { id } = socket;
            player1.position = playerData.position;
            socket.broadcast.emit('playerData', { id, playerNumber, playerData });
            break;
         case PlayerNumber.TWO:
            break;
         default:
            throw new Error('Unhandled player number in playerData');
      }
   })

   socket.on('selectPlayer', ({ playerNumber }) => {
      if (playerNumber === PlayerNumber.ONE) {
         if (player1 != null) {
            socket.emit('failed');
            return;
         }
         player1 = {
            user: {
               id: socket.id,
            }
         }
         socket.emit('createPlayer', { playerNumber: parseInt(playerNumber), isCurrentPlayer: true });
      }
   })

   socket.on('disconnect', function () {
      if (player1?.user?.id == socket.id) {
         player1 = null;
         socket.broadcast.emit('destroyPlayer', ({ playerNumber: PlayerNumber.ONE }))
      }
      console.log('A user disconnected');
   });
});

http.listen(3000, function() {
   console.log('listening on *:3000');
});