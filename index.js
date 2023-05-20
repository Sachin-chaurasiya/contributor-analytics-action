const github = require('@actions/github');

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = github.getOctokit(token);
    const context = github.context;

    const repo = context.payload.repository;
    const owner = repo.owner.login;
    const repoName = repo.name;

    // Fetch contributors
    const contributors = await octokit.rest.repos.listContributors({
      owner,
      repo: repoName,
    });

    console.log('Contributors:');
    for (const contributor of contributors.data) {
      const username = contributor.login;

      // Count pull requests
      const pullRequests = await octokit.rest.pulls.list({
        owner,
        repo: repoName,
        state: 'all',
        creator: username,
      });
      const pullRequestCount = pullRequests.data.length;

      // Count issues opened
      const issues = await octokit.rest.issues.listForRepo({
        owner,
        repo: repoName,
        state: 'all',
        creator: username,
      });
      const issueCount = issues.data.length;

      // Count code contributions
      const commits = await octokit.rest.repos.listCommits({
        owner,
        repo: repoName,
        author: username,
      });
      const codeCount = commits.data.length;

      console.log(`${username}:`);
      console.log(`Pull Requests: ${pullRequestCount}`);
      console.log(`Issues Opened: ${issueCount}`);
      console.log(`Code Contributions: ${codeCount}`);
      console.log('------------------------------');
    }
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
