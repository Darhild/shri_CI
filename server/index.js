const express = require('express');
const { AGENT_HOST, SERVER_PORT } = require('./../env.js');
const path = require('path');

const static = path.join(__dirname, 'static');

const app = express();

let agents = {};

app.use(express.json());
app.use(express.static(static));

app.get('/', (req, res) => {
  res.end(static)
})

app.post('/notify_agent', (req, res) => {
  const { port, agentId } = req.body;

  const agent = {
    host: AGENT_HOST, 
    port: port,
    isFree: true
  }

  agents[agentId] = agent;  
  console.log(agents);
})

app.post('/build', (req, res) => {
  const { hash, command } = req.body;
})

app.listen(SERVER_PORT);
console.log(`Server listens on Port ${SERVER_PORT}`)