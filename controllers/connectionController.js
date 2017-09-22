const api = require('../api');

exports.connect = socket => {
  const promises = respositories.map(repo => api.getRepository(repo));
  Promise.all(promises).then(response => {
    socket.emit('repositories', repositories);
  });
};
