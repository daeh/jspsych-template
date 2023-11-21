import { promises as fs } from 'fs'
import { platform } from 'os'
import { dirname, join, resolve } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectDirname = resolve(dirname(__dirname))

async function createLink() {
  // const packageRoot = process.env.INIT_CWD
  const sourceFile = join(projectDirname, 'eslint.config.mjs')
  const targetFile = join(projectDirname, 'eslint.config.js')

  console.log(`linking ${sourceFile} to ${targetFile}`)

  try {
    if (platform() === 'win32') {
      // On Windows, create a symbolic link
      await fs.symlink(sourceFile, targetFile, 'file')
      console.log('Symbolic link created successfully.')
    } else {
      // On Unix-like systems, create a hard link
      await fs.link(sourceFile, targetFile)
      console.log('Hard link created successfully.')
    }
  } catch (err) {
    console.error('Error creating link:', err.message)
  }
}

createLink().catch((err) => {
  console.error(err)
})
