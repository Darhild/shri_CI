const express = require('express');
const path = require('path');
const Datastore = require('nedb');
const { AGENT_HOST, SERVER_PORT, REPO_URL, BUILDS_DIR } = require('./../config');
const { findFreeAgent, runBuildOnAgent, saveBuildResults } = require('./serverHelpers');

const static = path.join(__dirname, 'static/index.pug');

const app = express();

let agents = {};

app.use(express.urlencoded());
app.use(express.json());
app.use(express.static(static));

app.get('/', (req, res) => {
  res.render(static, { buildsInfo: 'Some Information' })
})

app.get('/builds_info', (req, res) => {
  const buildsPath = path.join(__dirname, BUILDS_DIR);
  const db = new Datastore({filename : `${buildsPath}/builds_info`, autoload: true});
  db.find({}, (err, doc) => res.end(doc));
})

app.post('/notify_agent', (req, res) => {
  const { port, agentId } = req.body;

  const agent = {
    host: AGENT_HOST, 
    port: port,
    isFree: true
  }

  agents[agentId] = agent;  
})

app.post('/run_build', (req, res) => {
  const { commit, command } = req.body;
  const buildId = Math.floor(Math.random() * 1000);
  const agent = findFreeAgent(agents);

  if (agent) {
    runBuildOnAgent({
      agent,
      repoUrl: REPO_URL,
      buildId,      
      commit,
      command      
    });    
  }

  else console.log('Sorry, no agent is free now. Please try later');  
})

app.post('/notify_build_result', (req, res) => {
  const buildResult = req.body;  
  saveBuildResults(buildResult);
  agents[buildResult.agentId].isFree = true;
})

app.listen(SERVER_PORT);
console.log(`Server listens on Port ${SERVER_PORT}`)