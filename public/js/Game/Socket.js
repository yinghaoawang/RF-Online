import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";

const url = isLocalhost ? 'localhost:1260' : 'www.yinghaowang.com:1260';
const options = {
    transports: ['websocket']
}
const socket = io(url, options);

const handleP1Click = () => {
    socket.emit('selectPlayer', { playerNumber: PlayerNumber.ONE });
};

const handleP2Click = () => {
    socket.emit('selectPlayer', { playerNumber: PlayerNumber.TWO });
};

const startGame = ({ roomName }) => {
    game.stateMachine.changeState(game.playingState);
    menuInputsElement.setAttribute('hidden', true);
    roomInputsElement.removeAttribute('hidden');
    roomTextElement.innerHTML = 'Room ' + roomName;
}

const leaveGame = () => {
    game.stateMachine.changeState(game.menuState);
    roomInputsElement.setAttribute('hidden', true);
    menuInputsElement.removeAttribute('hidden');
    resetRoomSelect();
    socket.emit('getChannels');
}

p1ButtonElement.addEventListener('click', handleP1Click);
p2ButtonElement.addEventListener('click', handleP2Click);

const handleJoinRoomClick = () => {
    socket.emit('joinRoom', { roomName: selectedRoomName });
}

const handleLeaveRoomClick = () => {
    socket.emit('leaveRoom', { roomName: selectedRoomName });
    leaveGame();
}

joinRoomButtonElement.addEventListener('click', handleJoinRoomClick);
leaveRoomButtonElement.addEventListener('click', handleLeaveRoomClick);
createRoomButtonElement.addEventListener('click', handleCreateRoomClick);

let interval;

const onConnect = () => {
    console.log('connected');
    isConnected = true;
    if (interval != null) clearInterval(interval);

    socket.on('startGame', ({ roomName }) => {
        startGame({ roomName });
    });

    socket.on('leaveGame', () => {
        leaveGame();
    });

    socket.on('rooms', ({ roomData }) => {
        resetRoomSelect();
        for (const room of roomData) {
            addRoomToSelect(room);
        }
    });

    socket.on('failed', (data) => {
        let message = null;
        if (data == null || data.message == null) {
            message = 'Failed'
        } else {
            message = data.message;
        }
        alert(message);
    });

    socket.on('playerData', ({ playerNumber, playerData, id }) => {
        if (id !== socket.id) {
            game.playingState.updatePlayer(playerNumber, playerData);
        }
    });

    socket.on('destroyPlayer', ({ playerNumber }) => {
        game.playingState.setToDestroyPlayer(playerNumber);
    });

    socket.on('createPlayer', ({ playerNumber, isCurrentPlayer }) => {
        console.log(playerNumber);
        game.playingState.createPlayer(playerNumber, isCurrentPlayer);
        console.log('create player');
        const fps = 1000 / 60;

        interval = setInterval(() => {
            const { position, velocity, facingRight, animatingFrames, currentSprite, playerNumber } = game.playingState.currentPlayer;
            const { attacking, lastAttackTime, attackData, lastAttackIndex, health } = game.playingState.currentPlayer.combatModule;
            const combatModule = { attacking, lastAttackIndex, health };
            const playerData = { position, velocity, facingRight, animatingFrames, currentSprite, combatModule };
            socket.emit('playerData', { playerNumber, playerData, facingRight });
        }, fps);
    });

    socket.on('disconnect', () => {
        console.log('disconnected');
        if (interval != null) clearInterval(interval);
        leaveGame();
        isConnected = false;
    });
}

socket.on('connect', onConnect);
