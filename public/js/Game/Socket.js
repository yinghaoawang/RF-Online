import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";

const isLocalhost = location.hostname === "localhost" || location.hostname === "127.0.0.1";

const url = isLocalhost ? 'localhost:1260' : 'www.yinghaowang.com:1260';
const options = {
    transports: ['websocket']
}
const socket = io(url, options);

const handleP1Click = () => {
    socket.emit('selectPlayer', { playerNumber: PlayerNumber.ONE, characterName: selectedCharacterName });
};
const handleP2Click = () => {
    socket.emit('selectPlayer', { playerNumber: PlayerNumber.TWO, characterName: selectedCharacterName });
};

const startGame = ({ roomName }) => {
    game.stateMachine.changeState(game.playingState);
    menuInputsElement.setAttribute('hidden', true);

    roomInputsElement.removeAttribute('hidden');
    roomTextElement.innerHTML = roomName;
}

const leaveGame = () => {
    game.stateMachine.changeState(game.menuState);
    roomInputsElement.setAttribute('hidden', true);
    menuInputsElement.removeAttribute('hidden');
    resetRoomSelect();
    socket.emit('getChannels');
    if (interval != null) clearInterval(interval);
}

p1ButtonElement.addEventListener('click', handleP1Click);
p2ButtonElement.addEventListener('click', handleP2Click);

const handleJoinRoomClick = ({ selectedRoomName }) => {
    socket.emit('joinRoom', { roomName: selectedRoomName });
}

const handleLeaveRoomClick = () => {
    socket.emit('leaveRoom');
}

const handleCreateRoomClick = () => {
    socket.emit('createRoom');
}

const handleStopPlayingClick = () => {
    socket.emit('stopPlaying');
}

stopPlayingButtonElement.addEventListener('click', handleStopPlayingClick);
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

    socket.on('slots', ({ player1, player2 }) => {
        const isPlaying = player1?.userId === socket.id || player2?.userId === socket.id;

        if (player1) {
            p1ButtonElement.setAttribute('disabled', true);
        } else {
            p1ButtonElement.removeAttribute('disabled');
        }

        if (player2) {
            p2ButtonElement.setAttribute('disabled', true);
        } else {
            p2ButtonElement.removeAttribute('disabled');
        }

        if (isPlaying) {
            stopPlayingButtonElement.removeAttribute('disabled');
        } else {
            stopPlayingButtonElement.setAttribute('disabled', true);
        }
    });

    socket.on('rooms', ({ roomData }) => {
        console.log('rooms', roomData);
        resetRoomSelect();
        for (const room of roomData) {
            addRoomToContainer(room, handleJoinRoomClick);
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

    socket.on('playerData', ({ playerNumber, characterName, playerData, id }) => {
        if (id !== socket.id) {
            game.playingState.updatePlayer({playerNumber, playerData, characterName});
        }
    });

    socket.on('destroyPlayer', ({ playerNumber, id }) => {
        console.log('destroy');
        if (interval != null && id === socket.id) clearInterval(interval);
        game.playingState.setToDestroyPlayer(playerNumber);
    });

    socket.on('createPlayer', ({ playerNumber, isCurrentPlayer, characterName }) => {
        console.log(playerNumber);
        game.playingState.createPlayer({playerNumber, setAsCurrentPlayer: isCurrentPlayer, characterName});
        console.log('create player');
        const fps = 1000 / 60;

        interval = setInterval(() => {
            console.log('emitting');
            const { position, velocity, facingRight, animatingFrames, currentSprite, playerNumber } = game.playingState.currentPlayer;
            const { attacking, lastAttackTime, attackData, lastAttackIndex, health } = game.playingState.currentPlayer.combatModule;
            const combatModule = { attacking, lastAttackIndex, health };
            const playerData = { position, velocity, facingRight, animatingFrames, currentSprite, combatModule };
            const characterName = selectedCharacterName;
            socket.emit('playerData', { playerNumber, playerData, facingRight, characterName });
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
