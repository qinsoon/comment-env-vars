const core = require('@actions/core');
const github = require('@actions/github');

const { parseBody, mergeObjects } = require('./utils');

// Build for distribution: ncc build index.js

async function run() {
    try {
        // inputs
        const inputs = {
            token: core.getInput('token'),
            pull_request: core.getInput('pull_request'),
            default_parameters: core.getInput('default_env'),
            debug: core.getInput('debug')
        };
        console.log(`debug = ${core.getInput('debug')}`)
        const job_name = github.context.job;
        const debug = inputs.debug === 'true'

        if (debug) {
            console.log(`Looking for comments for job '${job_name}' with default envs '${inputs.default_parameters}'`);
        }

        // create a client
        const octokit = github.getOctokit(inputs.token);
        const [owner, repo] = process.env.GITHUB_REPOSITORY.split("/");

        // Check if we pass in pull request ID for the action.
        let pr = null;
        if (inputs.pull_request) {
            if (debug) {
                console.log(`Use pull request for ${inputs.pull_request} from input`);
            }
            pr = (await octokit.pulls.get({
                owner, repo,
                pull_number: inputs.pull_request,
            })).data;
        } else if (github.context.payload.pull_request) {
            if (debug) {
                console.log(`Use pull request from the current PR`);
            }
            pr = github.context.payload.pull_request;
        }

        if (!pr) {
            // Fail if we cannot resolve to any pull request
            core.setFailed('This aciton should take a pull_request input or be triggered by a pull request. We cannot resolve to a pull request.');
        }
        if (debug) {
            console.log(`Get env vars from pull request ${pr.number}`);
            console.log(`${JSON.stringify(pr)}`);
        }

        // get all comments
        const all_comments = [];
        const PER_PAGE = 30;
        let page = 1;

        try {
            while (true) {
                // Fetch a page
                const comments = (await octokit.issues.listComments({
                    owner, 
                    repo,
                    issue_number: pr.number,
                    per_page: PER_PAGE,
                    page,
                })).data;
                if (debug) {
                    console.log(`Fetched ${comments.length} comments from ${owner}/${repo}'s PR #${pr.number}`);
                }
                // Push all to the comments
                all_comments.push(...comments);
                // Check if there are more pages
                if (comments.length == PER_PAGE) {
                    page += 1;
                } else {
                    break;
                }
            }
        } catch (error) {
            console.log(`Failed to pull more comments: ${error}`);
        }

        // get params from comments
        const allowed_roles = ['COLLABORATOR', 'MEMBER', 'OWNER', 'CONTRIBUTOR'];
        let comment_params;
        for (let i = 0; i < all_comments.length; i++) {
            const comment = all_comments[i];
            if (debug) {
                console.log(`Check comment${i}: ${JSON.stringify(comment, undefined, 2)}`);
            }

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
