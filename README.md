Comment Environment Variables
---

This action allows extracting environment variables from pull request comments, 
so that they can be used to run the following actions. 

This action will search for all comments in the same pull request. If a comment 
starts with the same prefix as the job name, this action will treat the comment 
as the provided environment variables. It will extract key-value pairs, such as
`FOO=a, Bar=b` from the comment, and set it as environment variables. If there
are multiple comments that start with the prefix, it picks the first one.

Inputs
===

`token`

**Required** The GitHub token to access the repo, such as `${{ secrets.GITHUB_TOKEN }}`.

`default_env`

The default environment variables, such as `FOO=a, Bar=b`. Comma-separated key-value pairs. If we do not find those environment variables in the comment,
they have the default values defined by this input.

Example Usage
===

```yaml
on:
  pull_request

jobs:
  extract-env-var:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v2
      - name: Get Environment
        uses: qinsoon/comment-env-vars
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          default_env: 'FOO=1, BAR=2'
      - name: Print env var
        run: |
          printenv FOO
          printenv BAR
```

The action will print out `1` and `2` as the env vars `FOO` and `BAR`. However, if the pull request has a comment such as the following

```
extract-env-vars
FOO=a, BAR=b
```

The action will print `a` and `b` instead. 