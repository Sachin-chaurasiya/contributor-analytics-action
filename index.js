const github = require('@actions/github');
const fs = require('fs');

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

    let readmeContent = fs.readFileSync('README.md', 'utf8');
    readmeContent += '\n\nContributor Analytics:\n\n';

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

      readmeContent += `Username: ${username}\n`;
      readmeContent += `Pull Requests: ${pullRequestCount}\n`;
      readmeContent += `Issues Opened: ${issueCount}\n`;
      readmeContent += `Code Contributions: ${codeCount}\n`;
      readmeContent += '------------------------------\n';
    }

    fs.writeFileSync('README.md', readmeContent);

    // Commit the changes
    await octokit.rest.repos.createOrUpdateFileContents({
      owner,
      repo: repoName,
      path: 'README.md',
      message: 'Update contributor analytics',
      content: Buffer.from(readmeContent).toString('base64'),
      sha: repo.default_branch
        ? (
            await octokit.rest.repos.getContent({
              owner,
              repo: repoName,
              path: 'README.md',
            })
          ).data.sha
        : undefined,
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
