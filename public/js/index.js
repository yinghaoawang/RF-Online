const canvas = document.getElementById("canvas");
const ctx = canvas.getContext('2d');
canvas.width = 1024;
canvas.height = 576;

const game = new Game();

let isConnected = false;

game.start();