const express = require('express');
const app = express();

const fs = require('fs');
const http = require('http');
const https = require('https');

const server = process.env.NODE_ENV == 'production' ? https.createServer({
   key: fs.readFileSync(process.env.PATH_TO_PRIVATE_KEY),
   cert: fs.readFileSync(process.env.PATH_TO_CERTIFICATE) 
 }, app) : http.createServer(app);

 const io = require('socket.io')(server, {
   // secure: process.env.NODE_ENV == 'production' ? true : false,
   transports: ['websocket'],
 });

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
server.listen(PORT, () => {
   console.log(`Listening on port ${ PORT }`);
});