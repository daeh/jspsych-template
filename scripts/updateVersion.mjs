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

async function main() {
  const [, , newVersion, projectDir] = process.argv

  if (!newVersion || !projectDir) {
    console.log('Usage: node updateVersion.mjs <newVersion> <projectDir>')
    process.exit(1)
  }

  try {
    await updatePackageJsonVersion(newVersion, projectDir)
    console.log(`Version updated to ${newVersion} in package.json`)
  } catch (error) {
    console.error('Error updating version:', error)
    process.exit(1)
  }
}

main()
