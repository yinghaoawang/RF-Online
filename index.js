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
      if (playerData == null) {
         console.error('Null client player data in playerData');
         return;
      }
      
      switch (playerNumber) {
         case PlayerNumber.ONE:
            if (player1 == null) {
               console.error('Null server player in playerData');
               return;
            }
            player1.position = playerData.position;
            break;
         case PlayerNumber.TWO:
            if (player2 == null) {
               console.error('Null server player in playerData');
               return;
            }
            player2.position = playerData.position;
            break;
         default:
            throw new Error('Unhandled player number in playerData');
      }

      socket.broadcast.emit('playerData', { id: socket.id, playerNumber, playerData });
   })

   socket.on('selectPlayer', ({ playerNumber }) => {
      const newPlayerData = {
         user: {
            id: socket.id,
         }
      };

      if (player1?.user?.id === socket.id || player2?.user?.id === socket.id) {
         socket.emit('failed', { message: 'You are already playing' });
         return;
      }

      switch (playerNumber) {
         case PlayerNumber.ONE:
            if (player1 != null) {
               socket.emit('failed', { message: 'Player 1 already exists' });
               return;
            }
            player1 = newPlayerData;
            break;
         case PlayerNumber.TWO:
            if (player2 != null) {
               socket.emit('failed', { message: 'Player 2 already exists' });
               return;
            }
            player2 = newPlayerData;
            break;
         default:
            throw new Error('Unhandled playerNumber in selectPlayer');
      }

      socket.emit('createPlayer', { playerNumber, isCurrentPlayer: true });
   })

   socket.on('disconnect', function () {
      if (player1?.user?.id == socket.id) {
         player1 = null;
         socket.broadcast.emit('destroyPlayer', ({ playerNumber: PlayerNumber.ONE }))
      } else if (player2?.user?.id == socket.id) {
         player2 = null;
         socket.broadcast.emit('destroyPlayer', ({ playerNumber: PlayerNumber.TWO }))
      }
      console.log('A user disconnected');
   });
});

const PORT = 1260;
http.listen(PORT, function() {
   console.log(`Listening on *:${ PORT }`);
});