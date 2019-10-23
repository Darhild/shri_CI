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

  if(fs.existsSync(repoPath)) {
    rimraf.sync(repoPath);
  }

  try {
    await cloneRepo(repoUrl, BUILDS_DIR)
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

function notifyBuildResult(buildResult) {
  return fetch(`${SERVER_HOST}:${SERVER_PORT}/notify_build_result`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(buildResult)
  }) 
  .catch((err) => {
    console.log(err)
  })
}

module.exports = {
  notifyAgent: notifyAgent,
  runBuild: runBuild,
  notifyBuildResult: notifyBuildResult
}