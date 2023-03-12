import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const url = 'http://localhost:3000';
const socket = io(url);

const p1Button = document.getElementById('joinP1Button');
const p2Button = document.getElementById('joinP2Button');

const handleP1Click = () => {
    socket.emit('selectPlayer', { playerNumber: PlayerNumber.ONE });
};

p1Button.addEventListener('click', handleP1Click)

const onConnect = () => {
    console.log('connected');
    isConnected = true;

    socket.on('failed', () => {
        alert('Failed');
    })

    socket.on('playerData', ({ playerNumber, playerData, id }) => {
        switch (playerNumber) {
            case PlayerNumber.ONE:
                if (id !== socket.id) {
                    game.playingState.updatePlayer(PlayerNumber.ONE, playerData);
                }
                break;
            case PlayerNumber.TWO:
                break;
            default:
                throw new Error('Unhandled type in playerData');
        }
        
    });

    socket.on('destroyPlayer', ({ playerNumber }) => {
        game.playingState.setToDestroyPlayer(playerNumber);
    });

    socket.on('createPlayer', ({ playerNumber, isCurrentPlayer }) => {
        game.playingState.createPlayer(playerNumber, isCurrentPlayer);
        console.log('create player');
        const fps = 1000 / 60;

        setInterval(() => {
            const { position, velocity, facingRight, animatingFrames, currentSprite } = game.playingState.currentPlayer;
            const playerData = { position, velocity, facingRight, animatingFrames, currentSprite };
            socket.emit('playerData', { playerNumber, playerData, facingRight });
        }, fps);
    });

    socket.on('disconnect', () => {
        console.log('disconnected');
        isConnected = false;
    });
}

socket.on('connect', onConnect);