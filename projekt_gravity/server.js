import express from 'express';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Server } from 'socket.io';
import { createServer } from 'node:http';

// create a new express web server
let app = express();

// create a new socket.io server
const server = createServer(app);
const io = new Server(server);
const clients = {};

// get the directory where server.js is located
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// serve the index.html as starting page
app.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, "public", "index.html"))
});

// serve static files in the public folder
app.use(express.static('public'));

// a client has connected
io.on('connection', (socket) => {
    console.log('a client connected');

    // send a welcome message to the client
    socket.emit('msg', "welcome from the server");

    // forward the message to all clients except the sender
    socket.on('client_msg', (msg) => {
        io.emit('client_msg', msg); // Broadcast to all clients including the sender
    });

    // handle mouse movement data
    socket.on('mousemove', (mouseData) => {
        // update the current client's mouse position
        clients[socket.id] = mouseData;

        // broadcast all clients' mouse positions to all clients
        io.emit('mousemove', clients);
    });

    // handle button click to invert gravity
    socket.on('buttonClick', () => {
        // Invert gravity
        io.emit('invertGravity');
    });

    // handle client disconnection
    socket.on('disconnect', () => {
        console.log('a client disconnected');
        delete clients[socket.id];
        // notify other clients about the disconnected client
        io.emit('clientDisconnected', socket.id);
    });

    // send existing clients' mouse positions to the newly connected client
    socket.emit('mousemove', clients);
});

// start the webserver
let port = process.env.PORT || 8080;        // set our port
server.listen(port);
console.log('Magic happens on port ' + port);
