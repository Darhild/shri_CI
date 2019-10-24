const express = require('express');
const path = require('path');
const { AGENT_HOST, SERVER_PORT, REPO_URL } = require('./../config');
const { findFreeAgent, runBuildOnAgent, saveBuildResults } = require('./serverHelpers');
const db = require('./../db');

const indexPage = path.join(__dirname, 'static/index.pug');
const buildPage = path.join(__dirname, 'static/build.pug');

const app = express();

let agents = {};

app.use(express.urlencoded());
app.use(express.json());

app.get('/', (req, res) => { 
  db().then(() => {
    db.Builds.all()
    .then(buildsInfo => res.render(indexPage, { buildsInfo }))  
  })    
  .catch((err) => console.log(err))    
})

app.post('/run_build', async (req, res) => {
  const { commit, command } = req.body;
  let dbResult;

  try {
    dbResult = await db.Builds.lastId();    
  }
  catch(err) {
    console.log(err)
  }

  const prevBuildId = dbResult[0].id; 
  const buildId = prevBuildId + 1 || 1;

  if (findFreeAgent(agents)) {
    const [ agentId, agentParams ] = findFreeAgent(agents);
    agents[agentId].isFree = false;
    console.log(`${agentId} starts working.`)

    const data = {
      commitHash: commit,
      buildStart: '',
      buildEnd: '',
      buildStatus: 'pending',
      buildMessage: ''
    }
  
    db.Builds.create(data)
      .then(() => { 
        console.log(`Build number ${buildId} started.`)
      })
      .catch((err) => console.log(err))   

    try {
      await runBuildOnAgent({
        agent: agentParams,
        repoUrl: REPO_URL,
        buildId,      
        commit,
        command      
      });      
    }
    catch(err) {
      console.log(`Server could not connect with ${agentId}, error: ${err}`);
      delete agents[agentId]; 
      data.buildStatus = 'failed';
      data.buildMessage = err;
      db.Builds.update(buildId, data);  
    }    
  }  

  else console.log('Sorry, no agent is free now. Please try later');    
})

app.get('/build/:buildId', async (req, res) => {
  try {
    const result = await db.Builds.find(req.params.buildId);
    const build = result[0];
    res.render(buildPage, { build }) 
  }
  catch(err) {
    res.send(err)
  }  
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

app.post('/notify_build_result', async (req, res) => {
  const buildResult = req.body; 
  await saveBuildResults(buildResult);
  console.log(`Build number ${buildResult.buildId} finished.`)
  
  agents[buildResult.agentId].isFree = true;
  console.log(`${buildResult.agentId} is free now.`)
})

app.listen(SERVER_PORT);
console.log(`Server listens on Port ${SERVER_PORT}`)