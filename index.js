const core = require('@actions/core');
const github = require('@actions/github');

try {
    // trigger word
    const trigger = core.getInput('trigger');
    console.log(`Looking for trigger word: ${trigger}`);
    
    // default parameters
    const default_params = core.getInput('default_parameters');
    console.log(`With default parameters: ${default_params}`);

    // Get the JSON webhook payload for the event that triggered the workflow
    const payload = JSON.stringify(github.context.payload, undefined, 2)
    console.log(`The event payload: ${payload}`);

    // return empty for now
    core.setOutput('parameters', '');
  } catch (error) {
    core.setFailed(error.message);
  }