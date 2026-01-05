const { Octokit } = require('@octokit/rest');
const config = require('../config');

class GitHubService {
  constructor() {
    this.octokit = new Octokit({ auth: config.github.token });
  }

  async getPackageJson(owner, repo) {
    // Get repository info to determine default branch
    const { data: repoData } = await this.octokit.repos.get({
      owner,
      repo,
    });
    
    const defaultBranch = repoData.default_branch;
    
    const { data } = await this.octokit.repos.getContent({
      owner,
      repo,
      path: config.filePath,
      ref: defaultBranch,
    });
    const content = Buffer.from(data.content, 'base64').toString('utf8');
    return { content, sha: data.sha };
  }

  async updateFile(owner, repo, content, sha) {
    // Get repository info to determine default branch
    const { data: repoData } = await this.octokit.repos.get({
      owner,
      repo,
    });

    return this.octokit.repos.createOrUpdateFileContents({
      owner,
      repo,
      path: config.filePath,
      message: `Add ${config.dependency.name} dependency`,
      content: Buffer.from(content).toString('base64'),
      sha,
      branch: repoData.default_branch,
    });
  }

  async getOrgRepos(org) {
    const repos = [];
    let page = 1;
    while (true) {
      const { data } = await this.octokit.repos.listForOrg({
        org,
        per_page: 100,
        page,
        sort: 'updated',
      });
      if (data.length === 0) break;
      repos.push(...data.map(r => ({ owner: r.owner.login, repo: r.name })));
      page++;
    }
    return repos;
  }

  async hasFile(owner, repo, filePath) {
    try {
      await this.octokit.repos.getContent({
        owner,
        repo,
        path: filePath,
      });
      return true;
    } catch (error) {
      return false;
    }
  }
}

module.exports = new GitHubService(); 