import express from 'express';
import http from 'http';
import { Server } from 'socket.io';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
    }
});

const players = {};

io.on('connection', (socket) => {
    console.log("Jogador conectado: " + socket.id);

    // Definindo a posição inicial do jogador
    players[socket.id] = { x: 0, y: 0, direction: 0, frame: 0 };

    // Emitindo a lista de jogadores para o novo jogador
    io.emit("players", players);

    socket.on("move", (data) => {
        players[socket.id] = { ...players[socket.id], ...data };
        io.emit("players", players);
    });

    socket.on("disconnect", () => {
        delete players[socket.id];
        io.emit("players", players);
    });
});

server.listen(8080, () => {
    console.log("Servidor rodando na porta 8080");
});