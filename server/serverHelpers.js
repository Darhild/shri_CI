const db = require('./../db');
const fetch = require('node-fetch');

function findFreeAgent(agents) {
  for (agent in agents) {
    if (agents[agent].isFree) return [ agent, agents[agent] ];
  }

  return false;
}

function runBuildOnAgent({ agent, repoUrl, buildId, commit, command }) {
  return fetch(`${agent.host}:${agent.port}/build`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ agent, repoUrl, buildId, commit, command })    
  })
  .catch((err) => {
    console.log(`Sorry, build ${buildId} failed, error: ${err}`);
    db.Builds.update(buildId, { buildStatus: 'failed', buildMessage: err });
  })
}

async function saveBuildResults({ buildId, commitHash, buildStart, buildEnd, buildStatus, buildMessage }) {
  const data = {
    commitHash,
    buildStart,
    buildEnd,
    buildStatus,
    buildMessage
  }

  if(data.buildStatus === undefined) {
    data.buildStatus = 'success';
    data.buildMessage = buildMessage.stdout
  }  

  db.Builds.update(buildId, data).then(() => true);  
}

module.exports = {
  findFreeAgent: findFreeAgent,
  runBuildOnAgent: runBuildOnAgent,
  saveBuildResults: saveBuildResults 
}