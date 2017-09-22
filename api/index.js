const axios = require('axios');

axios.defaults.headers.common['Authorization'] = `token ${process.env
  .ACCESS_TOKEN}`;
axios.defaults.baseURL = 'https://api.github.com/repos/';

module.exports = {
  getRepository(repository) {
    return axios.get(`/${repository}`);
  }
};
