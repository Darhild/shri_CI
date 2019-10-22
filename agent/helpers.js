const { SERVER_HOST, SERVER_PORT } = require('./../env.js');
const fetch = require('node-fetch');

function notifyAgent (port, agentId) {
  return fetch(`${SERVER_HOST}:${SERVER_PORT}/notify_agent`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ port, agentId })
  }) 
  .catch((err) => {
    console.log(`${agentId} could not register on server, error: $`)
  }) 
}

module.exports = {
  notifyAgent: notifyAgent 
}