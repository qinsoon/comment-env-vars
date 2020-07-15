const core = require('@actions/core');
const github = require('@actions/github');

async function run() {
    try {
        // inputs
        const inputs = {
            token: core.getInput('token'),
            trigger: core.getInput('trigger'),
            default_parameters: core.getInput('default_parameters'),
        };

        console.log(`Looking for trigger word: ${inputs.trigger}`);
        console.log(`With default parameters: ${inputs.default_parameters}`);

        // create a client
        const octokit = github.getOctokit(inputs.token);

        // Get the JSON webhook payload for the event that triggered the workflow
        const payload = JSON.stringify(github.context.payload, undefined, 2)
        console.log(`The event payload: ${payload}`);

        // Check if the action is triggered by a pull request
        const pr = github.context.payload.pull_request;
        if (!pr) {
            core.setFailed('This aciton should be triggered by a pull request. github.context.payload.pull_request does not exist.');
        }

        // get all comments
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
        console.log(`Repo: ${owner}/${repo}`);
        const comments = await octokit.issues.listComments({
            owner, 
            repo,
            issue_number: pr.number,
        });
        console.log(`Comments: ${JSON.stringify(comments)}`);

        // return empty for now
        core.setOutput('parameters', '');
    } catch (error) {
    core.setFailed(error.message);
    }
}

run();
