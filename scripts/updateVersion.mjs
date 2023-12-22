import { promises as fs } from 'fs'
import path from 'path'

// Function to update the version in package.json
/**
 * @param {string} newVersion
 * @param {string} projectDir
 */
async function updatePackageJsonVersion(newVersion, projectDir) {
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  packageJson.version = newVersion
  await fs.writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf8')
}

// Function to update the version in globalVariables.ts
/**
 * @param {string} newVersion
 * @param {string} projectDir
 */
async function updateGlobalVariablesTs(newVersion, projectDir) {
  const globalVariablesPath = path.join(projectDir, 'hosting/src/globalVariables.ts')
  let content = await fs.readFile(globalVariablesPath, 'utf8')
  // const experimentId = 'expt-14.2.0'
  content = content.replace(/(const experimentId.*?=\s*['"])[^'"]+(['"])/, `$1expt-${newVersion}$2`)
  await fs.writeFile(globalVariablesPath, content, 'utf8')
}

async function main() {
  const [, , newVersion, projectDir] = process.argv

  if (!newVersion || !projectDir) {
    console.log('Usage: node updateVersion.mjs <newVersion> <projectDir>')
    process.exit(1)
  }

  try {
    await updatePackageJsonVersion(newVersion, projectDir)
    await updateGlobalVariablesTs(newVersion, projectDir)
    console.log(`Version updated to ${newVersion} in package.json and globalVariables.ts`)
  } catch (error) {
    console.error('Error updating version:', error)
    process.exit(1)
  }
}

main()
