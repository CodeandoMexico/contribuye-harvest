const api = require('../api');
const repositories = require('../repositories');

exports.connect = socket => {
  const promises = repositories.map(repo => api.getRepository(repo));
  Promise.all(promises)
    .then(response =>
      response.forEach(({ data }) => socket.emit('repository', data))
    )
    .catch(err => console.log(err));
};
