const fs = require('fs');
const path = require('path');
const rimraf = require('@alexbinary/rimraf');
const fetch = require('node-fetch');
const { cloneRepo, checkoutCommit, runCommand } = require('./buildHelpers');
const { SERVER_HOST, SERVER_PORT, BUILDS_DIR } = require('./../config.js');


function notifyAgent (port, agentId) {
  return fetch(`${SERVER_HOST}:${SERVER_PORT}/notify_agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ port, agentId })
  }) 
  .catch((err) => {
    console.log(`${agentId} could not register on server, error: ${err}`)
  }) 
}

async function runBuild({ repoUrl, commit, command }) {
  const repoName = path.basename(repoUrl);
  const repoPath = path.join(BUILDS_DIR, repoName);
  let repoExists;

  if(fs.existsSync(repoPath)) {
    rimraf.sync(repoPath);
    console.log('deleted');
  }

  try {
    await cloneRepo(repoUrl, BUILDS_DIR)
  }
  catch(err) {
    console.log(err)
  }  

  try {
    await checkoutCommit(commit, repoPath)
  }
  catch(err) {
    console.log(err)
  }  

  try {
    return await runCommand(commit, repoPath)
  }
  catch(err) {
    console.log(err)
  }  
}

function notifyBuildResult(agentId, id, data) {
  const buildResult = {
    agentId,
    bildId: id,
    buildData: data
  };

  return fetch(`${SERVER_HOST}:${SERVER_PORT}/notify_build_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildResult)
  }) 
  .catch((err) => {
    console.log('err')
  })
}

module.exports = {
  notifyAgent: notifyAgent,
  runBuild: runBuild,
  notifyBuildResult: notifyBuildResult
}