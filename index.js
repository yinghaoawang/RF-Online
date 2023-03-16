require('dotenv').config();
const express = require('express');
const fs = require('fs');
const http = require('http');
const https = require('https');
const app = express();
const expressApp = express();
const expressServer = http.createServer(expressApp);
//const expressServer = https.createServer(credentials, expressApp);

//const ioServer = http.createServer(app);

const ioServer = process.env.NODE_ENV === 'production' ? https.createServer({
   key: fs.readFileSync(process.env.PATH_TO_PRIVATE_KEY),
   cert: fs.readFileSync(process.env.PATH_TO_CERTIFICATE)
}, app) : http.createServer(app);

const SOCKET_PORT = 1260;
const EXPRESS_PORT = 1255;

const io = require('socket.io')(ioServer, {
   transports: ['websocket'],
});


const PlayerNumber = {
   ONE: 1,
   TWO: 2
}

const basename = process.env.NODE_ENV == 'production' ? '/' : '/rf-online';
expressApp.use(basename, express.static('public'));

let roomPlayerData = [];
let roomCounter = 1;

const getRoomPlayerData = ({ socket }) => {
   const playerRoomName = getUserRoomName({ socket }) || getUserRoomByMatch({ socket });
   if (playerRoomName == null) {
      console.error('Could not find user\'s room in playerData');
      return { player1: null, player2: null, currentPlayerRoom: null };
   }

   let currentPlayerRoom = roomPlayerData[playerRoomName];
   if (currentPlayerRoom == null) {
      roomPlayerData[playerRoomName] = {
         player1: null, player2: null
      };
      currentPlayerRoom = roomPlayerData[playerRoomName];
   }
   let player1 = currentPlayerRoom.player1;
   let player2 = currentPlayerRoom.player2;
   return { player1, player2, playerRoomName, currentPlayerRoom };
}

const getUserRoomName = ({ socket }) => {
   return [...socket.rooms.values()][1];
}

const getUserRoomByMatch = ({ socket }) => {
   for (const roomData of getRoomData()) {
      const { users, name } = roomData;
      if (users.includes(socket.id)) return name;
   }
   return null;
}

const getRoomData = () => {
   let clientIds = [];
   io.sockets.sockets.forEach(socket => {
      clientIds.push(socket.id);
   });

   const gameRooms = [];
   const rooms = io.sockets.adapter.rooms;
   for (const [key, value] of rooms.entries()) {
      // exclude default created rooms
      if (clientIds.includes(key)) continue;
      gameRooms.push({ name: key, users: [...value] });
   }

   return gameRooms;
}

io.on('connection', function(socket) {
   const sendRooms = () => {
      io.emit('rooms', { roomData: getRoomData() });
   }

   const sendSlots = (payload) => {
      if (payload == null) {
         const { player1, player2, playerRoomName } = getRoomPlayerData({ socket });
         io.to(playerRoomName).emit('slots', { player1, player2 });
      } else {
         const { player1, player2, playerRoomName } = getRoomPlayerData({ socket });
         console.log(payload.player1, payload.player2);
         console.log({ player1: payload.player1 || player1, player2: payload.player2 || player2 });
         io.to(playerRoomName).emit('slots', { player1: payload.player1 || player1, player2: payload.player2 || player2 });
      }
   }

   const onConnect = () => {
      console.log('A user connected');
      sendRooms();
   }

   onConnect();

   const startGame = () => {
      const roomName = getUserRoomName({ socket });
      socket.emit('startGame', { roomName });
   }

   const getPlayerNumber = () => {
      const { player1, player2 } = getRoomPlayerData({ socket });
      if (player1?.userId == socket.id) {
         return PlayerNumber.ONE;
      } else if (player2?.userId == socket.id) {
         return PlayerNumber.TWO;
      } else {
         return null;
      }
   }

   const leaveGame = () => {
      const playerNumber = getPlayerNumber();
      if (playerNumber != null) {
         destroyPlayer({ playerNumber });
      }

      socket.emit('leaveGame');
   }

   const destroyPlayer = ({ playerNumber }) => {
      const { playerRoomName, currentPlayerRoom } = getRoomPlayerData({ socket });
      io.to(playerRoomName).emit('destroyPlayer', { playerNumber, id: socket.id });
      if (playerNumber === PlayerNumber.ONE) currentPlayerRoom.player1 = null;
      else if (playerNumber === PlayerNumber.TWO) currentPlayerRoom.player2 = null;
      else throw new Error('Unhandled playerNumber in destroyPlayer');
      sendSlots();
   }

   const createPlayer = ({ playerNumber }) => {
      socket.emit('createPlayer', { playerNumber, isCurrentPlayer: true });
      const player1 = playerNumber === PlayerNumber.ONE ? { userId: socket.id } : null;
      const player2 = playerNumber === PlayerNumber.TWO ? { userId: socket.id } : null;
      sendSlots({ player1, player2 });
   }

   const onJoinRoom = ({ roomName }) => {
      const roomData = getRoomData();
      const room = roomData.find(r => r.name === roomName);
      if (room == null) {
         socket.emit('failed', { message: 'Room not found' });
         return;
      }
      const { name } = room;

      socket.join(name);
      sendSlots();
      startGame();
      sendRooms();
   }

   socket.on('getRooms', () => {
      socket.emit({ roomData: getRoomData() });
   });

   socket.on('createRoom',  () => {
      const roomName = 'ROOM' + roomCounter;
      socket.join(roomName);
      roomCounter++;
      onJoinRoom({ roomName });
      startGame();
      sendRooms();
   });

   socket.on('stopPlaying', () => {
      const playerNumber = getPlayerNumber();
      if (playerNumber != null) {
         destroyPlayer({ playerNumber });
      }
   });

   socket.on('leaveRoom', () => {
      const roomName = getUserRoomName({ socket });
      leaveGame();
      socket.leave(roomName);
      socket.emit('rooms', { roomData: getRoomData() });
   });

   socket.on('joinRoom', onJoinRoom);

   socket.on('playerData', ({ playerNumber, playerData }) => {
      if (playerData == null) {
         console.error('Null client player data in playerData');
         return;
      }

      const playerRoomName = getUserRoomName({ socket });
      const { player1, player2 } = getRoomPlayerData({ socket });

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

      socket.broadcast.to(playerRoomName).emit('playerData', { id: socket.id, playerNumber, playerData });
   })

   socket.on('selectPlayer', ({ playerNumber }) => {
      const { player1, player2, currentPlayerRoom } = getRoomPlayerData({ socket });

      if (player1?.userId === socket.id || player2?.userId === socket.id) {
         socket.emit('failed', { message: 'You are already playing' });
         return;
      }

      switch (playerNumber) {
         case PlayerNumber.ONE:
            if (player1 != null) {
               socket.emit('failed', { message: 'Player 1 already exists' });
               return;
            }
            currentPlayerRoom.player1 = { userId: socket.id };
            break;
         case PlayerNumber.TWO:
            if (player2 != null) {
               socket.emit('failed', { message: 'Player 2 already exists' });
               return;
            }
            currentPlayerRoom.player2 = { userId: socket.id };
            break;
         default:
            throw new Error('Unhandled playerNumber in selectPlayer');
      }

      createPlayer({ playerNumber });
   })

   socket.on('disconnecting', function () {
      leaveGame();
      sendRooms();
   });

   socket.on('disconnect', () => {
      console.log('A user disconnected');
      sendRooms();
   });
});

ioServer.listen(SOCKET_PORT, () => {
   console.log(`Socket.io listening on port ${ SOCKET_PORT }`);
});
expressServer.listen(EXPRESS_PORT, () => {
    console.log(`Express listening on port ${ EXPRESS_PORT }`);
});
