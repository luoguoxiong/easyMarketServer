const { htmlEscape } = require('escape-goat');
const getRepoInfo = require('git-repo-info');
const { execa } = require('@umijs/utils');
const chalk = require('chalk');
const git = require('./git');
const _exec = require('./utils');
const lernaCli = require.resolve('lerna/cli');

const logErrorAndExit = (message) => {
  console.error(chalk.red(message));
  process.exit(1);
};

function logStep(name) {
  console.log(`${chalk.gray('>> Release:')} ${chalk.magenta.bold(name)}`);
}

const getChangelog = async() => {
  const repoUrl = 'https://github.com/luoguoxiong/hulljs';
  const latest = await git.latestTagOrFirstCommit();
  const log = await git.commitLogFromRevision(latest);

  if (!log) {
    throw new Error('get changelog failed, no new commits was found.');
  }

  const commits = log.split('\n').map((commit) => {
    const splitIndex = commit.lastIndexOf(' ');
    return {
      message: commit.slice(0, splitIndex),
      id: commit.slice(splitIndex + 1),
    };
  });

  return (nextTag) =>
    `${commits
      .map((commit) => `- ${htmlEscape(commit.message)}  ${commit.id}`)
      .join('\n') }\n\n${repoUrl}/compare/${latest}...${nextTag}`;
};

const release = async() => {
//   const { branch } = getRepoInfo();
//   branch !== 'main' && logErrorAndExit('your must release in main branch!');
//   const isAddAll = await git.gitIsAddAll();
//   !isAddAll && logErrorAndExit('git status is not clean. exit...');
  logStep('git status is checked');
  logStep('build');
  //   const { stderr } = await _exec('npm run build');
  //   console.log(chalk.green(stderr));
  //   const logs = await getChangelog();
  //   console.log(logs(''));
  logStep('update version by lerna version');
  await _exec('npm run version');
//   await execa(lernaCli, [
//     'version',
//     '--exact',
//     '--no-commit-hooks',
//     '--no-git-tag-version',
//     '--no-push',
//   ]);
//   console.log(stdout);
};

release();
