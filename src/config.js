require('dotenv').config();

const repos = require('./nuxt_repos.json');
// Constants for GitHub and dependency configuration
const config = {
  github: {
    token: process.env.GITHUB_TOKEN,
    mainBranch: 'main',
  },
  dependency: {
    name: 'gsap',
    version: '^3.11.3',
    oldVersion: 'npm:@gsap/shockingly@^3.11.3',  // Only update if this value matches (optional)
    mode: 'update',  // 'add' or 'update'
  },
  filePath: 'package.json',
  repositories: repos,
};

module.exports = config; 