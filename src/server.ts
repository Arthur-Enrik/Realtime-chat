import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import { Request, Response } from 'express';
import http from 'http';
import { Server } from 'socket.io';
import socketHandler from './Sockets/socketHandler.js';
import { MessagesList } from './Sockets/socketHandler.js';

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static('public'));
app.use(express.json());

app.get('/api/history', (req: Request, res: Response): void => {
  res.status(200).json(MessagesList());
  return;
});

const serverStarting = async (): Promise<void> => {
  const port: number = Number(process.env.PORT);
  server.listen(port, async (): Promise<void> => {
    console.log(`Server up!\nport: ${port}\nurl: http://localhost:${port}/`);
    socketHandler(io);
  });
};

serverStarting();
