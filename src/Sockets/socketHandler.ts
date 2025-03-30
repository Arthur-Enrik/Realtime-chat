import { Server, Socket } from 'socket.io';

let users: Array<{ [username: string]: string }> = [];
let messageHistory: Array<IDataMessages> = [];

interface IDataMessages {
  username: string;
  message: string;
}

const addUserToHistory = (username: string, id: string): void => {
  const userIndex = users.findIndex((user) => username in user);

  if (userIndex !== -1) {
    users[userIndex][username] = id;
  } else {
    users.push({ [username]: id });
  }
};

const addMessageToHistory = (data: IDataMessages): void => {
  messageHistory.push(data);
};

const socketHandler = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    const username = socket.handshake.query.username as string;
    addUserToHistory(username, socket.id);
    console.log(`user connected ID: ${socket.id}`);

    socket.on('sendMessage', (data: IDataMessages) => {
      addMessageToHistory(data);
      socket.broadcast.emit('receiveMessage', data);
    });
  });
};

export const MessagesList = () => {
  return messageHistory;
};

export default socketHandler;
