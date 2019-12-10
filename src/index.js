// Import Lib
const github = require('@actions/github')
const core = require('@actions/core')
const exec = require('shelljs.exec')
// Get input from github
const token = core.getInput('GITHUB_TOKEN', {required: true})
const prefixBranches = core.getInput('PREFIX_BRANCHES')
const defaultBranches = core.getInput('DEFAULT_BRANCHES')
const msg = core.getInput('COMMIT_MESSAGE')
const titlePR = core.getInput('TITLE_PR')
const bodyPR = core.getInput('BODY_PR')

const octokit = new github.GitHub(token)
const context = github.context
const actor = context.actor

const todayDate = Date.now()
const currentBranches = `${prefixBranches}/patch-${todayDate}`

async function run() {
  try {
    core.info('Starting Setup file ...')
    await gitSetup().then(() => {
      core.info('Starting commit and push ...')
    })
    await gitCommitAndPush().then(() => {
      core.info('Starting pull request ...')
    })
    await createPullRequest().then(() => {
      core.info('Done.')
    })
  } catch (err) {
    core.setFailed(err.message)
  }
}

async function gitSetup() {
  const pathNetRC = '$HOME/.netrc'

  const credentialGithub = (actor, token) => {
    return `cat <<- EOF > ${pathNetRC}
    machine github.com
    login ${actor}
    password ${token}

    machine api.github.com
    login ${actor}
    password ${token}
EOF`
  }

  const createFile = await exec(credentialGithub(actor, token), {async: true})
  if (!createFile.ok) {
    core.setFailed(`Error: ${createFile.stderr}`)
    process.exit(1)
  } else {
    const addPermission = await exec('chmod 600 ' + pathNetRC, {async: true})
    if (!addPermission.ok) {
      core.setFailed(`Error: ${createFile.stderr}`)
      process.exit(1)
    } else {
      core.info('Done Setup file.')
    }
  }
}

async function gitCommitAndPush() {
  const checkout = await exec(`git checkout -b ${currentBranches}`, {
    async: true,
  })
  if (!checkout.ok) {
    core.setFailed(`Error: ${checkout.stderr}`)
    process.exit(1)
  } else {
    core.info(checkout.stdout)
  }

  const status = await exec(`git status -s`, {async: true})
  if (status.stdout === '') {
    core.warning(`nothing to commit, working tree clean`)
    process.exit(0)
  } else {
    core.info(`We have been file changed \n${status.stdout}`)
  }

  const add = await exec(`git add -A`, {async: true})
  if (!add.ok) {
    core.setFailed(`Error: ${add.stderr}`)
    process.exit(1)
  } else {
    core.info(`We have been file added \n${status.stdout}`)
  }

  const configUserName = await exec(
    `git config --global user.name "${actor}"`,
    {
      async: true,
    },
  )
  if (!configUserName.ok) {
    core.setFailed(`Error: ${configUserName.stderr}`)
    process.exit(1)
  }

  const configUserEmail = await exec(
    `git config --global user.email "${actor}@example.com"`,
    {async: true},
  )
  if (!configUserEmail.ok) {
    core.setFailed(`Error: ${configUserEmail.stderr}`)
    process.exit(1)
  }

  const commit = await exec(`git commit -m "${msg}"`, {async: true})
  if (!commit.ok) {
    core.setFailed(`Error: ${commit.stdout}`)
    process.exit(1)
  } else {
    core.info(commit.stdout)
  }

  const push = await exec(
    `git push --set-upstream origin "HEAD:${currentBranches}"`,
    {
      async: true,
    },
  )
  if (!push.ok) {
    core.setFailed(`Error: ${push.stdout}`)
    process.exit(1)
  } else {
    core.info(push.stdout)
    core.info('Done commit and push.')
  }
}

async function createPullRequest() {
  let messagePR
  if (!titlePR) {
    messagePR = msg
  } else {
    messagePR = titlePR
  }
  await octokit.pulls.create({
    ...context.repo,
    title: messagePR,
    body: bodyPR,
    head: currentBranches,
    base: defaultBranches,
  })
}

run()
