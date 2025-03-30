const receiveLoginForm = (e) => {
  e.preventDefault();
  const inputUsername = document.querySelector('#login-input');
  const username = inputUsername.value;
  inputUsername.value = '';
  if (!username.trim()) return;
  sessionStorage.clear();
  sessionStorage.setItem('username', JSON.stringify(username));
  toggleWindow();
  socketManager.connect(username);
  getMessages();
};

const receiveMessage = (e) => {
  e.preventDefault();
  const inputMessage = document.querySelector('#message-input');
  const message = inputMessage.value;
  inputMessage.value = '';
  if (!message || !message.trim()) return;
  processMessageToSend(message, () => renderMessage({ message }, 'self'));
};

const processMessageToSend = (message, callback) => {
  const username = JSON.parse(sessionStorage.getItem('username'));
  if (!username) window.location.reload();
  const data = { username, message };
  socketManager.sendMessage(data);
  callback();
};

const getMessages = async () => {
  try {
    const res = await fetch('http://localhost:3000/api/history');
    if (!res.ok) return;
    const data = await res.json();
    renderRequestedMessages(data);
  } catch (error) {
    return console.error(error);
  }
};

const renderRequestedMessages = (arrayMsg) => {
  const messageContainer = document.querySelector('main');
  const username = JSON.parse(sessionStorage.getItem('username'));
  arrayMsg.forEach((item) => {
    let origin = null;
    if (username.toLowerCase() === item.username.toLowerCase()) {
      origin = 'self';
    }
    const data = { username: item.username, message: item.message };
    const html = htmlFormat(data, origin);
    messageContainer.innerHTML += html;
  });
};

const renderMessage = (data, origin) => {
  const messageContainer = document.querySelector('main');
  const html = htmlFormat(data, origin);
  messageContainer.innerHTML += html;
};

const htmlFormat = ({ username, message }, origin) => {
  if (origin === 'self') {
    return `
        <div class="self-nessage messages">
            <p>
            ${message}
            </p>
        </div>
        `;
  } else {
    return `
        <div class="other-nessage messages">
            <span class="message-author">${username}</span>
            <p>
              ${message}
            </p>
        </div>
        `;
  }
};

const toggleWindow = () => {
  const mainWindow = document.querySelector('main');
  const messageForm = document.querySelector('#form-section');
  const loginWindow = document.querySelector('#login-section');
  mainWindow.style.display = 'flex';
  messageForm.style.display = 'flex';
  loginWindow.style.display = 'none';
};

class socketHandler {
  constructor() {
    this.socket = null;
    this.username = null;
  }
  connect = (username) => {
    this.username = username;
    this.socket = io({
      query: { username: this.username },
    });
    this.socket.on('receiveMessage', (data) => renderMessage(data));
  };
  sendMessage = (data) => {
    this.socket.emit('sendMessage', data);
  };
}

const socketManager = new socketHandler();
document.querySelector('#login-form').addEventListener('submit', receiveLoginForm);
document.querySelector('#form-section').addEventListener('submit', receiveMessage);
