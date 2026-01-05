const inquirer = require('inquirer');
const chalk = require('chalk');
const fs = require('fs');
const path = require('path');
const config = require('./config');
const { updateRepository, updateAllRepositories } = require('./update-dependency');
const githubService = require('./services/github');

async function promptForRepository() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'List all repositories', value: 'list' },
        { name: 'Update a specific repository', value: 'single' },
        { name: 'Update all repositories', value: 'all' },
        { name: 'Sync repos from GitHub', value: 'sync' },
        { name: 'Add new repository to config', value: 'add' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);

  if (action === 'exit') {
    console.log(chalk.blue('Goodbye! 👋'));
    process.exit(0);
  }

  if (action === 'add') {
    await addNewRepository();
    return promptForRepository();
  }

  if (action === 'all') {
    await updateAllRepositories();
    return promptForRepository();
  }

  if (action === 'list') {
    await listRepositories();
    return promptForRepository();
  }

  if (action === 'sync') {
    await syncReposFromGitHub();
    return promptForRepository();
  }

  // For single repository update
  const { repository } = await inquirer.prompt([
    {
      type: 'list',
      name: 'repository',
      message: 'Select a repository to update:',
      choices: config.repositories.map(repo => ({
        name: `${repo.owner}/${repo.repo}`,
        value: repo
      }))
    }
  ]);

  await updateRepository(repository.owner, repository.repo);
  return promptForRepository();
}

async function listRepositories() {
  console.log(chalk.blue('\nListing all configured repositories:'));
  config.repositories.forEach(({ owner, repo }) => {
    console.log(chalk.white(`- ${owner}/${repo}`));
  });
  console.log(); // Empty line for better readability
}

async function syncReposFromGitHub() {
  console.log(chalk.blue('\nFetching repos from roostergrin organization...'));
  try {
    const allRepos = await githubService.getOrgRepos('roostergrin');
    console.log(chalk.gray(`Found ${allRepos.length} total repos. Filtering for Nuxt projects...`));

    const nuxtRepos = [];
    for (const repo of allRepos) {
      const hasNuxtConfig = await githubService.hasFile(repo.owner, repo.repo, 'config/nuxt.config.js');
      if (hasNuxtConfig) {
        nuxtRepos.push(repo);
        console.log(chalk.gray(`  ✓ ${repo.repo}`));
      }
    }

    const filePath = path.join(__dirname, 'nuxt_repos.json');
    fs.writeFileSync(filePath, JSON.stringify(nuxtRepos, null, 2) + '\n');
    config.repositories = nuxtRepos; // Update in-memory config too
    console.log(chalk.green(`✅ Synced ${nuxtRepos.length} Nuxt repositories to nuxt_repos.json`));
  } catch (error) {
    console.error(chalk.red(`❌ Error syncing repos: ${error.message}`));
  }
}

async function addNewRepository() {
  const { owner, repo } = await inquirer.prompt([
    {
      type: 'input',
      name: 'owner',
      message: 'Enter the repository owner (organization or username):',
      validate: input => input.length > 0
    },
    {
      type: 'input',
      name: 'repo',
      message: 'Enter the repository name:',
      validate: input => input.length > 0
    }
  ]);

  config.repositories.push({ owner, repo });
  console.log(chalk.green(`✅ Added ${owner}/${repo} to the repository list`));
}

// Start the CLI
console.log(chalk.blue('🚀 Dependency Updater CLI'));
console.log(chalk.gray(`Current dependency: ${config.dependency.name}@${config.dependency.version}\n`));

promptForRepository().catch(error => {
  console.error(chalk.red('Unexpected error:', error));
  process.exit(1);
}); 