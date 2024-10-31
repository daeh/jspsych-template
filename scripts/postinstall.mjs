import { promises as fs } from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const srcPath = path.join(__dirname, '..', 'hosting', 'src', 'creds-template.ts')
const destPath = path.join(__dirname, '..', 'hosting', 'src', 'creds.ts')

/**
 * @typedef {Object} SetupResult
 * @property {boolean} success - Indicates if the setup was successful
 * @property {string} message - Descriptive message about the operation
 */

/**
 * Copies the credentials template file if it doesn't already exist
 * @returns {Promise<SetupResult>}
 */
async function setup() {
  try {
    await fs.access(srcPath)
  } catch (err) {
    return {
      success: true,
      message: `Template file ${srcPath} not found :: ${err}`,
    }
  }

  try {
    await fs.access(destPath)
    return {
      success: true,
      message: `${destPath} already exists. Skipping.`,
    }
  } catch (err) {
    // File doesn't exist, proceed with copy
    console.debug(`${destPath} does not exist, proceeding with copy :: ${err}`)
  }

  try {
    await fs.copyFile(srcPath, destPath)
    return {
      success: true,
      message: `Created ${destPath} from template.`,
    }
  } catch (err) {
    return {
      success: false,
      message: `Error creating ${destPath} :: ${err}`,
    }
  }
}

/**
 * Main function to run the setup
 */
async function main() {
  const result = await setup()
  console.log(result.message)
  if (!result.success) {
    process.exit(1)
  }
}

main().catch((err) => {
  console.error('Unexpected error:', err)
  process.exit(1)
})
