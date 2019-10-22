const express = require('express');
const { SERVER_PORT } = require('./../env.js');
const { notifyAgent } = require('./helpers.js');

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

  app.listen(SERVER_PORT + num);

  console.log(`${agentId} listens on Port ${agentPort}`);

  notifyAgent(agentPort, agentId);
}