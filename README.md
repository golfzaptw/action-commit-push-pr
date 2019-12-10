<div align="center"><h1>Actions Commit Push And Pull Request</h1></div>

This action is a commit push and open pull request.

## Configuration with With

The following settings must be passed as environment variables as shown in the
example.

| Key                | Value                                       | Suggested Type | Required | Default              |
| ------------------ | ------------------------------------------- | -------------- | -------- | -------------------- |
| `GITHUB_TOKEN`     | Personal github token.                      | `secret env`   | **Yes**  | N/A                  |
| `PREFIX_BRANCHES`  | Prefix branches that need to be created.    | `env`          | No       | `tmp`                |
| `DEFAULT_BRANCHES` | Branches that want to be open pull request. | `env`          | No       | `master`             |
| `COMMIT_MESSAGE`   | Commit message.                             | `env`          | No       | `chore: update file` |
| `TITLE_PR`         | Title pull request.                         | `env`          | No       | `chore: update file` |
| `BODY_PR`          | Description body pull request.              | `env`          | No       | `''`                 |

## Example usage

```yml
name: Update branches
on:
  schedule:
    - cron: '0 2 * * *'
jobs:
  update:
    runs-on: ubuntu-latest
    steps:
      # Do something ex. yarn install and execute get some file.
      - name: Commit push and pr
        uses: ./
        with:
          GITHUB_TOKEN: ${{secrets.GITHUB_TOKEN}}
          PREFIX_BRANCHES: 'update'
          DEFAULT_BRANCHES: 'develop'
          COMMIT_MESSAGE: 'update value'
          TITLE_PR: 'Chore: get some file update'
          BODY_PR: ''
```
