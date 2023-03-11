import { io } from "https://cdn.socket.io/4.4.1/socket.io.esm.min.js";
const url = 'http://localhost:3000';
const socket = io(url);

const onConnect = () => {
    console.log('connected');
    isConnected = true;

    socket.on('disconnect', () => {
        console.log('disconnected');
        isConnected = false;
    });
}

socket.on('connect', onConnect);