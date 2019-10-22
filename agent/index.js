const express = require('express');
const { SERVER_PORT } = require('./../config');
const { notifyAgent, runBuild, notifyBuildResult } = require('./agentHelpers');

const numberOfAgents = +process.argv[2];

runAgent(1);

if(numberOfAgents && !isNaN(numberOfAgents)) {
  for(let i = 2; i <= numberOfAgents; i++) {
    runAgent(i);
  }
}

function runAgent(num) {
  const app = express();
  const agentPort = SERVER_PORT + num;
  const agentId = `agent${num}`;

  app.use(express.json());

  app.post('/build', async (req, res) => {
    const buildInfo = req.body;
    const buildData = await runBuild(buildInfo);
    console.log(buildData);
    notifyBuildResult(agentId, buildInfo.buildId, buildData);  
  })

  app.listen(SERVER_PORT + num);

  console.log(`${agentId} listens on Port ${agentPort}`);

  notifyAgent(agentPort, agentId);
}