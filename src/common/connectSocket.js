const url = require('url');

const verifyToken = require('../middlewares/verifyChatSocketToken');
const {
  get,
  create,
} = require('../controllers/messages');

const messageTypesHandlers = {
  'get old': get,
  message: create,
};

const connectSocket = (wss) => wss.on('connection', async (socket, request) => {
  console.log('ESTABLISHED SOCKET CONNECTION');

  const {
    chatId,
    token,
  } = url.parse(request.url, true).query;

  const userId = await verifyToken(token, chatId);
  if (!userId) {
    socket.terminate();
    return;
  }

  socket.userId = userId;
  socket.chatId = chatId;

  socket.on('message', (message) => {
    const {
      type,
      content,
    } = JSON.parse(message);

    const handler = messageTypesHandlers[type];

    handler && handler(wss, socket)(content);
  });
});

module.exports = connectSocket;
