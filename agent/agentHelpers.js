const path = require('path');
const fetch = require('node-fetch');
const { cloneRepo, checkoutCommit, runCommand } = require('./buildHelpers');
const { SERVER_HOST, SERVER_PORT, BUILDS_DIR } = require('./../config.js');

async function notifyAgent (port, agentId) {
  return fetch(`${SERVER_HOST}:${SERVER_PORT}/notify_agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ port, agentId })
  }) 
}

async function runBuild({ repoUrl, commit, command }, time) {
  const repoName = path.basename(repoUrl);
  const newRepoName = `${repoName}_${commit}_${time}`;
  const repoPath = path.join(BUILDS_DIR, newRepoName);

  try {
    await cloneRepo(repoUrl, newRepoName, BUILDS_DIR)
  }
  catch(err) {
    return err;     
  }  

  try {
    await checkoutCommit(commit, repoPath)
  }
  catch(err) {
    return err;   
  }  

  try {
    return await runCommand(command, repoPath);    
  }
  catch(err) {
    return err;    
  }  
}

async function notifyBuildResult(buildResult) {
  return fetch(`${SERVER_HOST}:${SERVER_PORT}/notify_build_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildResult)
  }) 
}

module.exports = {
  notifyAgent: notifyAgent,
  runBuild: runBuild,
  notifyBuildResult: notifyBuildResult
}