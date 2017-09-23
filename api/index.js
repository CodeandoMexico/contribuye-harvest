const axios = require('axios');

axios.defaults.headers.common['Authorization'] = `token ${process.env
  .ACCESS_TOKEN}`;
axios.defaults.baseURL = 'https://api.github.com/repos';

module.exports = {
  getRepository(repository) {
    return axios.get(`/${repository}`);
  },
  getEvents(repository) {
    return axios.get(`/${repository}/issues/events`);
  },
  createWebHook(
    repository,
    settings = {
      name: 'web',
      active: true,
      events: ['issues', 'pull_request'],
      config: { url: 'http://example.com/webhook', content_type: 'json' }
    }
  ) {
    return axios.post(`/${repository}/hooks`, settings);
  }
};
