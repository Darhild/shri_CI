const express = require('express');
const { SERVER_PORT } = require('./../config');
const { notifyAgent, runBuild, notifyBuildResult } = require('./agentHelpers');

const numberOfAgents = +process.argv[2];

if(numberOfAgents && !isNaN(numberOfAgents)) {
  for(let i = 1; i <= numberOfAgents; i++) {
    runAgent(i);
  }
}

else runAgent(1);

async function runAgent(num) {
  const app = express();
  const agentPort = SERVER_PORT + num;
  const agentId = `agent${num}`;

  app.use(express.json());

  app.post('/build', async (req, res) => {
    const buildInfo = req.body;
    const buildResult = {
      agentId: agentId,
      commitHash: buildInfo.commit, 
      buildId:  buildInfo.buildId,
      buildStart: new Date()    
    };

    const timeStr = Date.parse(buildResult.buildStart);

    try {
      buildResult.buildMessage = await runBuild(buildInfo, timeStr);
      
      if(buildResult.buildMessage.stderr.indexOf('ERR') !== -1) {
        buildResult.buildStatus = 'failed';
        buildResult.buildMessage = buildResult.buildMessage.stderr;
      };
    }
    catch(err) {
      buildResult.buildStatus = 'failed';
      buildResult.buildMessage = err;
    } 

    buildResult.buildEnd = new Date(); 
    
    try {
      await notifyBuildResult(buildResult);
    }
    catch(err) {
      console.log(`${buildResult.agentId} could not save results of build number ${buildResult.buildId}, error: ${err}`)
    }
    
  })

  app.listen(SERVER_PORT + num);

  console.log(`${agentId} listens on Port ${agentPort}`);

  try {
    await notifyAgent(agentPort, agentId);
  }
  catch(err) {
    console.log(`${agentId} could not register on server, error: ${err}`)
  }
}