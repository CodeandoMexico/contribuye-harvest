const api = require('../api');
let repositories = require('../repositories');

let firstSocket = true;

const repositoriesPromises = repositories.map(repo => api.getRepository(repo));
const issuesPromises = repositories.map(repo => api.getEvents(repo));
const mapData = responses => responses.map(response => response.data);
const mapIssue = (issue, repository) => ({
  id: issue.id,
  url: issue.html_url,
  title: issue.title,
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
    const repository = repositories.find(repository => {
      return repository.url === issue.repository_url;
    });
    return mapIssue(issue, transformRepository(repository));
  });
};

const transformRepository = repository => {
  return {
    name: repository.name,
    url: repository.html_url,
    language: repository.language
  };
};

exports.connect = async (socket, io) => {
  let repositories = await Promise.all(repositoriesPromises).then(responses =>
    mapData(responses)
  );
  let issues = await Promise.all(issuesPromises);
  issues = mapData(issues);
  issues = issues.reduce((prev, curr) => [...prev, ...curr]);

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
      emitIssues(transformIssues(issues, repositories), sockets);
    });
  }, 30000);
};

const emitIssues = (issues, socket) => {
  socket.emit('events', issues);
};

const emitRepositories = (repositories, socket) => {
  repositories = repositories.map(transformRepository);
  socket.emit('repositories', repositories);
};
