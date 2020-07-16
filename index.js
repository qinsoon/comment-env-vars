const core = require('@actions/core');
const github = require('@actions/github');

const { parseBody, mergeObjects } = require('./utils');

async function run() {
    try {
        // inputs
        const inputs = {
            token: core.getInput('token'),
            default_parameters: core.getInput('default_env'),
        };
        const job_name = github.context.job;

        console.log(`Looking for comments for job: ${job_name}`);
        console.log(`With default parameters: ${inputs.default_parameters}`);

        // create a client
        const octokit = github.getOctokit(inputs.token);

        // Check if the action is triggered by a pull request
        const pr = github.context.payload.pull_request;
        if (!pr) {
            core.setFailed('This aciton should be triggered by a pull request. github.context.payload.pull_request does not exist.');
        }

        // get all comments
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");
        const comments = (await octokit.issues.listComments({
            owner, 
            repo,
            issue_number: pr.number,
        })).data;

        // get params from comments
        const allowed_roles = ['COLLABORATOR', 'MEMBER', 'OWNER'];
        let comment_params;
        for (let i = 0; i < comments.length; i++) {
            const comment = comments[i];
            const body = comment.body.trim();
            if (body.startsWith(job_name)
                && allowed_roles.find(x => x == comment.author_association)) {
                comment_params = parseBody(body);
                // only take the first comment that matches
                break;
            }
        }

        // get default parameters
        const default_params = parseBody(inputs.default_parameters);

        // merge parameters
        const final_params = mergeObjects(default_params, comment_params);
        
        console.log(`Default parameters: ${JSON.stringify(default_params, undefined, 2)}`);
        console.log(`Comment parameters: ${JSON.stringify(comment_params, undefined, 2)}`);
        console.log(`Final: ${JSON.stringify(final_params, undefined, 2)}`);

        // export each parameters as variable
        Object.keys(final_params).forEach((key) => {
            core.exportVariable(key, final_params[key]);
        });
    } catch (error) {
        core.setFailed(error.message);
    }
}

run();
