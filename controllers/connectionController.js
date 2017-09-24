const api = require('../api');
let repositories = require('../repositories');

let firstSocket = true;

const repositoriesPromises = repositories.map(repo => api.getRepository(repo));
const issuesPromises = repositories.map(repo => api.getEvents(repo));
const mapData = responses => responses.map(response => response.data);
const mapIssue = (issue, repository) => ({
  id: issue.id,
  url: issue.url,
  comments: issue.comments,
  createdAt: issue.created_at,
  updatedAt: issue.updated_at,
  repository_url: issue.repository_url,
  repository,
  labels: issue.labels.map(label => ({
    name: label.name,
    color: label.color
  }))
});
const transformIssues = (issues, repositories) => {
  return issues.map(({ issue }) => {
    const repository = repositories.find(
      repository => repository.url === issue.repository_url
    );
    return mapIssue(issue, repository);
  });
};

const transformRepositories = repositories => {
  return repositories.map(repository => ({
    name: repository.name,
    url: repository.url,
    language: repository.language
  }));
};

exports.connect = async (socket, io) => {
  let repositories = await Promise.all(repositoriesPromises).then(responses =>
    mapData(responses)
  );
  let issues = await Promise.all(issuesPromises);
  issues = mapData(issues);
  issues = issues.reduce((prev, curr) => [...prev, ...curr]);

  repositories = transformRepositories(repositories);
  issues = transformIssues(issues, repositories);
  emitIssues(issues, socket);
  emitRepositories(repositories, socket);
  if (firstSocket) {
    console.log('FIRST CONNECTION');
    firstSocket = false;
    issuesInterval(io.sockets, repositories);
  }
};

const issuesInterval = (sockets, repositories) => {
  setInterval(() => {
    Promise.all(issuesPromises).then(responses => {
      let issues = mapData(responses);
      issues = issues.reduce((prev, curr) => [...prev, ...curr]);
      emitIssues(
        transformIssues(issues, transformRepositories(repositories)),
        sockets
      );
    });
  }, 30000);
};

const emitIssues = (issues, socket) => {
  socket.emit('events', issues);
};

const emitRepositories = (repositories, socket) => {
  socket.emit('repositories', repositories);
};
