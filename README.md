# Serverless jsPsych Template

### Build from Source

- Fork this repo: `Use this template` > `Create a new repository`
- Git clone the forked repo (replace with your repo info): e.g. `git clone --branch main https://github.com/daeh/jspsych-template.git jspsych-template`
- Enter the repo folder (replace with your repo info): e.g. `cd jspsych-template`

after you replace `.firebaserc` and `firebaseConfig.ts` with your info

```shell
###
### From within the forked-and-cloned repo folder
###

### Install the Firebase dependencies
npm install

### Push the Firestore rules (defined in firestore.rules)
npm run deploy-rules

### Enter the experiment
cd "hosting" || exit

### Install the experiment dependencies
npm install

### Start the Vite server
npm run dev
```



### Modify the experiment

Open the project in your preferred IDE. Configuration instructions are given below.



### Sandbox

When developing the experiment, you can set `const sandy = true` in `hosting/globalVars.ts`. This will increase the verbosity of the console output. 



### Prolific Configuration



![Prolific_param](readme-assets/Prolific_param.png)





---



This is a future-looking configuration that implements the major developments from [ESLint](https://eslint.org).

### ESLint Config

Beginning in ESLint `v9.0.0`, the default will be the new [flat config system](https://eslint.org/docs/latest/use/configure/configuration-files-new). This will depreciate the `Common.js Module` config system (which uses `.eslintrc.js`), replacing it with the `ES Module` config system (which uses `eslint.config.js`).

### ESLint Stylistic

ESLint is [depreciating formatting rules](https://eslint.org/blog/2023/10/deprecating-formatting-rules/), passing over maintenance and development to the community-run plugin [ESLint Stylistic](https://eslint.style/).

## This Example Config

The main file in this repo is the flat ESLint config, [eslint.config.mjs](https://github.com/daeh/eslint-template/blob/main/eslint.config.mjs). This project is configured as a `ES Module`, so this file could be named `eslint.config.js`, but I have given it the `.mjs` extension to make this config work for `Common.js Module` development with minimal reconfiguration.

While ESLint has no issue using the `.mjs` config file, IDEs like VS Code and IntelliJ IDEA currently require the `.js` extension. A simple workaround is to make an alias `eslint.config.js` that points to `eslint.config.mjs`. This is done automatically during install by the `package.json` file.

This project uses **Typescript** and **Prettier**, and includes the `tsconfig.json` and `.prettierrc.json` files. The ESLint config integrates these configurations.

## Installation

Install the dependancies using [npm](https://www.npmjs.com/) or [Yarn](https://yarnpkg.com/), e.g.

```shell
### Clone git repo to the current working directory
git clone --branch main https://github.com/daeh/eslint-template.git eslint-template

### Enter the new directory
cd eslint-template

### Install Node packages
npm install
```

In addition to installing the dependancies, this will create the `eslint.config.js` link to `eslint.config.mjs`.

### VS Code Settings

For VS Code to respect the configuration, you need to specify the formatter for the relevant files. This is done for you in `hosting.code-workspace` and in `hosting/.vscode/settings.json` (you only need one). This configures VS Code to use the ESLint flat config system, to use the [Prettier - Code Formatter](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extension to format Javascript, HTML, JSON, and CSS files. This obviously requires the [ESLint](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint) and [Prettier](https://marketplace.visualstudio.com/items?itemName=esbenp.prettier-vscode) extensions to be enabled for the workspace.

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.experimental.useFlatConfig": true,
  "[javascript][javascriptreact][typescript]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[html]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[json][jsonc]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  },
  "[css][scss][less]": {
    "editor.defaultFormatter": "esbenp.prettier-vscode"
  }
}
```



#### Tailwind

Install https://marketplace.visualstudio.com/items?itemName=bradlc.vscode-tailwindcss



### IntelliJ IDEA Settings

This should work out of the box for IntelliJ (once the `eslint.config.js` file has been created). Make sure you have enabled ESLint and Prettier for the project:

- `Settings... > Languages & Frameworks > JavaScript > Code Quality Tools > ESLint`
  - Enable `Automatic ESLint configuration`
  - Enable `Run eslint --fix on save`
- `Settings... > Languages & Frameworks > JavaScript > Prettier`
  - Enable `Automatic Prettier configuration`
  - Enable `Run on save`

If you change the project from an `ES Module` to a `Common.js Module`, or if ESLint isn't working, try [this fix from Ditlef Diseth](https://youtrack.jetbrains.com/issue/WEB-61117/ESLint-flat-config-doesnt-work-with-non-default-custom-path-to-the-config-file#focus=Comments-27-8196242.0-0).

## Usage

Once your IDE settings are configured, you should see unused variable warnings in the three test files provided in `src/`.

You can format, lint and build the project from the command line by calling the commands in `package.json`,

```json
{
  "scripts": {
    "build": "tsc --project tsconfig.dev.json --noEmit",
    "lint": "ESLINT_USE_FLAT_CONFIG=true prettier --write . && eslint --config eslint.config.mjs --fix ."
  }
}
```

by running `npm run lint`, `npm run build`, etc.

## Author

[![Personal Website](https://img.shields.io/badge/personal%20website-daeh.info-orange?style=for-the-badge)](https://daeh.info) [![BlueSky](https://img.shields.io/badge/bsky-@dae.bsky.social-blue?style=for-the-badge)](https://bsky.app/profile/dae.bsky.social) [![Twitter](https://img.shields.io/badge/twitter-@DaeHoulihan-white?style=for-the-badge&logo=twitter)](https://twitter.com/DaeHoulihan)
