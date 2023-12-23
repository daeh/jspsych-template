import file from '../package.json' with { type: 'json' }

async function main() {
  console.log(file.version)
}

main()
