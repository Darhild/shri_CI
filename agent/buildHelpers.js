const { exec } = require('child_process');
const { promisify } = require('util');
const asyncExec = promisify(exec);

async function cloneRepo(url, name, path) {
  return asyncExec(`git clone ${url} ${name}`, { cwd: path})
}

async function checkoutCommit(commitHash, path) {
  return asyncExec(`git checkout ${commitHash}`, { cwd: path})
}

async function runCommand(command, path) {
  return asyncExec(command, { cwd: path})
}

module.exports = {
  cloneRepo: cloneRepo,
  checkoutCommit: checkoutCommit,
  runCommand: runCommand
}