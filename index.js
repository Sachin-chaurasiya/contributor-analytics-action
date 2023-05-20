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
    contributors.data.forEach((contributor) => {
      console.log({ contributor });
      console.log(`${contributor.login}: ${contributor.contributions}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
