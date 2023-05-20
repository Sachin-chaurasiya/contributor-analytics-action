const { GitHub, context } = require('@actions/github');

async function run() {
  try {
    const token = process.env.GITHUB_TOKEN;
    const octokit = new GitHub(token);

    const repo = context.payload.repository;
    const owner = repo.owner.login;
    const repoName = repo.name;

    // Fetch contributors
    const contributors = await octokit.repos.listContributors({
      owner,
      repo: repoName,
    });

    console.log('Contributors:');
    contributors.data.forEach((contributor) => {
      console.log(`${contributor.login}: ${contributor.contributions}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

run();
