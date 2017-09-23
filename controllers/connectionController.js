const api = require('../api');
let repositories = require('../repositories');

let ioNeeded = {};

let ioPromise = new Promise(resolve => { ioNeeded.resolve = resolve})
const promises = [...repositories.map(repo => api.getRepository(repo)),ioPromise];

let getRepositories = Promise.all(promises)
.then(responses => {
  let io = responses.splice(responses.length -1, 1)[0];
  return repositoriesInterval(responses,io);
})
.catch(err => console.log(err));


exports.connect = (socket,io) => {
  ioNeeded.resolve(io);
  emitRepositories(getRepositories,io);
};

const repositoriesInterval = (responses,io) => {
  let allData = emitResponse(responses,io);
  setTimeout(() => {
    setInterval(() => {
      allData.then(emitResponse(responses,io));
    }, 30000);
  },30000);

  return allData;
};

const emitResponse = (responses,io) => {
  let allResponses = responses.map(data => fetchRepository(io,data));
  return emitRepositories(Promise.all(allResponses))
}

const fetchRepository = (data) => {
  const { full_name: name } = data;

  return api.getEvents(name);
};

const emitRepositories = (repositoriesPromise ,io) => {
  repositoriesPromise.then(repos=>{
    io.sockets.emit('repositories',repos);
    return repos;
  });
};