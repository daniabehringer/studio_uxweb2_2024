import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

// Erstellt neuen Webserver
let app = express();

// Erstellt neuen Socket.io-Server
const server = createServer(app);
const io = new Server(server);
const clients = {};  // Objekt zur Speicherung von Client-Mauspositionen

// Ermittelt Verzeichnis, in dem sich server.js befindet
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Liefert index.html als Startseite aus
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"))
});

// Liefert statische Dateien im public-Verzeichnis aus
app.use(express.static('public'));

// Verbindung zum Client
io.on('connection', (socket) => {
    console.log('Ein Client hat sich verbunden');

    // Sendet Willkommensnachricht an Client
    socket.emit('msg', "Willkommen vom Server");

    // Leitet Nachricht an alle Clients ausser Absender weiter
    socket.on('client_msg', (msg) => {
        io.emit('client_msg', msg);
    });

    // Mausbewegungsdaten
    socket.on('mousemove', (mouseData) => {
        clients[socket.id] = mouseData;
        io.emit('mousemove', clients);
    });

    // Klick-Button zum Umkehren der Gravitation
    socket.on('buttonClick', () => {
        // Gravitation umkehren
        io.emit('invertGravity');
    });

    // Client-Trennung
    socket.on('disconnect', () => {
        console.log('Ein Client hat sich getrennt');
        delete clients[socket.id];
        io.emit('clientDisconnected', socket.id);
    });

    // Sendet Mauspositionen vorhandener Clients an neu verbundenen Client
    socket.emit('mousemove', clients);
});

// Startet Webserver
let port = process.env.PORT || 8080;        // Port
server.listen(port);
console.log('Die Magie passiert auf Port ' + port);