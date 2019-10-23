const { exec } = require('child_process');
const { promisify } = require('util');
const asyncExec = promisify(exec);

async function cloneRepo(url, path) {
  return asyncExec(`git clone ${url}`, { cwd: path})
}

async function checkoutCommit(commitHash, path) {
  return asyncExec(`git checkout ${commitHash}`, { cwd: path})
}

async function runCommand(command, path) {
  return asyncExec(`npm ${command}`, { cwd: path})
}

module.exports = {
  cloneRepo: cloneRepo,
  checkoutCommit: checkoutCommit,
  runCommand: runCommand
}