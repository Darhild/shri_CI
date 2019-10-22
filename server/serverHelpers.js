const fs = require('fs');
const path = require('path');
const { promisify } = require('util');
const Datastore = require('nedb');
const fetch = require('node-fetch');
const { BUILDS_DIR } = require('./../config');

function findFreeAgent(agents) {
  for (agent in agents) {
    if (agents[agent].isFree) return agents[agent];
  }

  return false;
}

function runBuildOnAgent({ agent, repoUrl, buildId, commit, command }) {
  return fetch(`${agent.host}:${agent.port}/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ repoUrl, buildId, commit, command })    
  })
  .catch((err) => {
    console.log(`Sorry, build ${buildId} failed, error: ${err}`);
  })
}

function saveBuildResults({ buildId, buildData }) {
  let buildStatus;  
  const db = new Datastore({filename : `${BUILDS_DIR}/builds_info`, autoload: true});
  buildData.stderr ? buildStatus = 'error' : buildStatus = 'success';

  db.insert({
    buildId,
    buildStatus,
    out: buildData.stdout
  });
}

module.exports = {
  findFreeAgent: findFreeAgent,
  runBuildOnAgent: runBuildOnAgent,
  saveBuildResults: saveBuildResults 
}