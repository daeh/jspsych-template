/* eslint-disable unicorn/no-process-exit */

import { promises as fs } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

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
  } catch (error) {
    return {
      success: true,
      message: `Template file ${srcPath} not found :: ${error}`,
    }
  }

  try {
    await fs.access(destPath)
    return {
      success: true,
      message: `${destPath} already exists. Skipping.`,
    }
  } catch (error) {
    // File doesn't exist, proceed with copy
    console.debug(`${destPath} does not exist, proceeding with copy :: ${error}`)
  }

  try {
    await fs.copyFile(srcPath, destPath)
    return {
      success: true,
      message: `Created ${destPath} from template.`,
    }
  } catch (error) {
    return {
      success: false,
      message: `Error creating ${destPath} :: ${error}`,
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

// eslint-disable-next-line unicorn/prefer-top-level-await
main().catch((error) => {
  console.error('Unexpected error:', error)
  process.exit(1)
})
