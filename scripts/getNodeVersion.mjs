import { promises as fs } from 'fs'
import path from 'path'

async function main() {
  const projectDir = process.argv[2]
  const packageJsonPath = path.join(projectDir, 'package.json')
  const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf8'))
  console.log(packageJson.version)
}

main()
