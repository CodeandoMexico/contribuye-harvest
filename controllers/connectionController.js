const api = require('../api');
let repositories = require('../repositories');
const subscriptions = {};

exports.connect = socket => {
  const promises = repositories.map(repo => api.getRepository(repo));
  Promise.all(promises)
    .then(response =>
      response.forEach(({ data }) => {
        socket.emit('repository', data);
        socket.on('unsubscribeRepository', unsubscribeToRepository);
        subscribeToRepository(socket, data);
      })
    )
    .catch(err => console.log(err));
};

const subscribeToRepository = (socket, repository) => {
  const { full_name: name } = repository;

  subscriptions[name] = setInterval(() => {
    api.getEvents(name).then(({ data }) => {
      console.log(data);
      socket.emit(`events/${name}`, data);
    });
  }, 30000);
};

const unsubscribeToRepository = (socket, { full_name: name }) => {
  clearInterval(subscriptions[name]);
};
