import { promises as fs } from 'fs'
import path from 'path'
import readlineSync from 'readline-sync'
import pkg from 'shelljs'
// import * as shell from 'shelljs'
const { cd, exec, error } = pkg
// Import the package.json file
import file from '../package.json' assert { type: 'json' }
process.env.FORCE_COLOR = '1'
function getVersion() {
  // Cast the imported file to the PackageJson type
  const packageJson = file
  // Now access the version safely
  const version = packageJson.version
  return version
}
// Function to update the version in package.json
async function updatePackageJsonVersion(newVersion, projectDir) {
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  packageJson.version = newVersion
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8')
}
// Function to check last command's exit status
function checkStatus(task) {
  if (error()) {
    console.log('\n-------------------------------------------------------------')
    console.error(`${task} failed, aborting the script.`)
    console.log('-------------------------------------------------------------\n')
    process.exit(1)
  }
}
async function rest(project) {
  // Get the current version
  const currentVersion = getVersion()
  checkStatus('Get Current Version')
  // Change to the hosting directory or exit if it fails
  cd(`${project}/hosting`)
  checkStatus('Change Directory to Hosting')
  // Run linting
  console.log(
    '\n-------------------------------------------------------------\n' +
      'Linting...' +
      '\n-------------------------------------------------------------\n',
  )
  exec('yarn lint:prod')
  checkStatus('Lint Hosting')
  exec('yarn lint-parent')
  checkStatus('Lint Parent')
  cd(`${project}/`)
  console.log(
    '\n-------------------------------------------------------------\n\n' + `Current Version: ${currentVersion}`,
  )
  let newVersion = currentVersion
  let gitPorcelain = false
  let tag = false
  if (exec('git status --porcelain', { silent: true }).stdout === '') {
    gitPorcelain = true
    console.log(
      '\n-------------------------------------------------------------\n' +
        'Git Repo is up to date, moving on...' +
        '\n-------------------------------------------------------------\n',
    )
  } else {
    console.log('\n-------------------------------------------------------------\n')
    // const incrementVersion = readlineSync.keyInYNStrict('Do you want to increment the version number?')
    const incrementVersion = readlineSync.keyIn(
      '>>> Do you want to increment the version number? ( yes [y], no [n], exit [x] ):  ',
      { limit: 'YyNncCxXqQ' },
    )
    if (['c', 'x', 'q'].includes(incrementVersion.toLowerCase())) {
      process.exit(0)
    }
    if (incrementVersion.toLowerCase() === 'y') {
      newVersion = readlineSync.question('>>> Enter the new version number:  ')
      if (/^[0-9]+\.[0-9]+\.[0-9]+$/.test(newVersion)) {
        await updatePackageJsonVersion(newVersion, project)
        await updatePackageJsonVersion(newVersion, path.join(project, 'hosting'))
        tag = true
        console.log(
          '\n-------------------------------------------------------------\n' +
            'Version update completed successfully.' +
            '\n-------------------------------------------------------------\n',
        )
      } else {
        console.error('\nInvalid version format. Version was not incremented.\n')
        process.exit(1)
      }
    }
  }
  checkStatus('Version Update')
  if (gitPorcelain) {
    console.log(
      '\n-------------------------------------------------------------\n' +
        'No changes to commit.' +
        '\n-------------------------------------------------------------\n',
    )
  } else {
    console.log(
      '\n-------------------------------------------------------------\n' +
        'Modified files:' +
        '\n-------------------------------------------------------------\n',
    )
    exec('git status --porcelain')
    checkStatus('Git Status')
    console.log('\n---\n')
    exec('git status')
    checkStatus('Git Status')
    readlineSync.question(
      '\n>>> Modified files shown above' + '\n>>> Press Enter to continue to the commit process, or Ctrl+C to abort.\n',
    )
    exec('git add .')
    checkStatus('Git Add')
    console.log(
      '\n-------------------------------------------------------------\n' +
        'Changes to be committed:' +
        '\n-------------------------------------------------------------\n',
    )
    exec('GIT_PAGER=cat git diff --cached')
    checkStatus('Git Diff')
    readlineSync.question(
      '\n>>> Diffs shown above' + '\n>>> Press Enter to continue to the commit process, or Ctrl+C to abort.\n',
    )
    console.log(
      '\n-------------------------------------------------------------\n' +
        'Starting Git commit process...' +
        '\n-------------------------------------------------------------\n',
    )
    const commitMsg = readlineSync.question('>>> Enter your commit message:  ')
    exec(`git commit -m "${commitMsg}"`)
    checkStatus('Git Commit')
  }
  if (tag) {
    console.log('\n-------------------------------------------------------------\n')
    // const tagCommit = readlineSync.keyInYNStrict('Do you want to TAG this commit with the version number?')
    const tagCommit = readlineSync.keyIn(
      '>>> Do you want to TAG this commit with the version number? ( yes [y], no [n], exit [x] ):  ',
      { limit: 'YyNncCxXqQ' },
    )
    if (['c', 'x', 'q'].includes(tagCommit.toLowerCase())) {
      process.exit(0)
    }
    if (tagCommit) {
      exec(`git tag -a "v${newVersion}" -m "Version ${newVersion}"`)
      console.log(
        '\n-------------------------------------------------------------\n' +
          `Tag v${newVersion} added.` +
          '\n-------------------------------------------------------------\n',
      )
    }
  }
  checkStatus('Tag Release')
  cd(`${project}/hosting`)
  console.log(
    '\n-------------------------------------------------------------\n' +
      'Building project...' +
      '\n-------------------------------------------------------------\n',
  )
  exec('yarn build:prod')
  checkStatus('Build')
  cd(`${project}/`)
  console.log(
    '\n-------------------------------------------------------------\n' +
      'Deploying project...' +
      '\n-------------------------------------------------------------\n',
  )
  exec('yarn deploy-rules')
  checkStatus('Deploy Rules')
  exec('yarn deploy')
  checkStatus('Deploy Hosting')
  console.log(
    '\n-------------------------------------------------------------\n' +
      'Script completed successfully.' +
      '\n-------------------------------------------------------------\n',
  )
}
function main(project) {
  if (project) {
    rest(project).then(
      () => {
        process.exit(0)
      },
      (err) => {
        console.error(err)
        process.exit(1)
      },
    )
  } else {
    console.error('\nNo project specified.\n')
    process.exit(1)
  }
}
main(process.argv[2])
