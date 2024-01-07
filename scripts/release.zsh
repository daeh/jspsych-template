#!/usr/bin/env zsh

# Define the project directory from the first argument
project=$1

# Function to check last command's exit status
check_status() {
    if [ $? -ne 0 ]; then
        printf "\n%s\n%s failed, aborting the script.\n%s\n" "$separator" "$1" "$separator"
        exit 1
    fi
}

# Define a horizontal separator
separator="-------------------------------------------------------------"

# Get the current version
currentVersion=$(node "scripts/getVersion.mjs")
check_status "Get Version"

# Change to the hosting directory or exit if it fails
cd "${project}/hosting" || { printf "Failed to change directory to ${project}/hosting\n"; exit 1; }

# Run linting
printf "\n%s\nRunning linting...\n" "$separator"
yarn lint:prod
yarn lint-parent
check_status "Linting"

cd "${project}/" || { printf "Failed to change directory to ${project}/\n"; exit 1; }

printf "\n%s\n\nCurrent Version: %s\n" "$separator" "$currentVersion"

TAG='N'
if [ -z "$(git status --porcelain)" ]; then

    printf "\n%s\nGit Repo is up to date, moving on...\n" "$separator"

else

    printf "\n%s\n" "$separator"
    read -q "REPLY?Do you want to increment the version number? (y/n): "
    echo

    if [[ $REPLY =~ ^[Yy]$ ]]; then
        printf "Enter the new version number: "
        read new_version
        # Ensure the version format is valid
        if [[ $new_version =~ ^[0-9]+\.[0-9]+\.[0-9]+$ ]]; then
            
            # If version was updated, run update version script
            if [[ -n "$new_version" ]]; then
                node "scripts/updateVersion.mjs" "$new_version" "$project"
                node "scripts/updateVersion.mjs" "$new_version" "$project/hosting"

                TAG='Y'

                printf "\n%s\nVersion update completed successfully.\n%s\n" "$separator" "$separator"
            fi
        else
            printf "\nInvalid version format. Version was not incremented.\n"
            exit 1
        fi
    fi

    printf "\n%s\nMoving on...\n%s\n" "$separator" "$separator"

fi

check_status "VersionUpdate"


# Git commit process
# Check for changes
# if git diff-index --quiet HEAD --; then
if [ -z "$(git status --porcelain)" ]; then
    printf "\n%s\nNo changes to commit.\n%s\n" "$separator" "$separator"
else
    # Display changes
    printf "\n%s\nModified files:\n%s\n" "$separator" "$separator"

    git status --porcelain

    # Prompt to continue
    printf "\nPress Enter to continue to the commit process, or Ctrl+C to abort.\n"
    read -r

    git add .

    printf "\n%s\nChanges to be committed:\n%s\n" "$separator" "$separator"

    # Bypassing the pager for git diff
    GIT_PAGER=cat git diff --cached
    printf "\n%s\n" "$separator"

    # Prompt to continue
    printf "\nPress Enter to continue to the commit process, or Ctrl+C to abort.\n"
    read -r

    # Start Git commit process
    printf "\n%s\nStarting Git commit process...\n%s\n" "$separator" "$separator"
    printf "Enter your commit message: "
    read -r commitMsg

    # Commit changes
    git commit -m "$commitMsg"
    check_status "GitCommit"

fi

check_status "Commit"


# After successful commit
if [[ $TAG =~ ^[Yy]$ ]]; then
    printf "\n%s\n" "$separator"
    read -q "REPLYTAG?Do you want to TAG this commit with the version number? (y/n): "
    echo

    if [[ $REPLYTAG =~ ^[Yy]$ ]]; then
        git tag -a "v$new_version" -m "Version $new_version"
        printf "\nTag v$new_version added.\n"
    fi
fi
check_status "Tag Release"

cd "${project}/hosting" || { printf "Failed to change directory to ${project}/hosting\n"; exit 1; }

# Run build
printf "\n%s\nBuilding project...\n" "$separator"
yarn build:prod
check_status "Build"

# Change to the parent directory
cd "${project}/" || { printf "Failed to change directory to ${project}/hosting\n"; exit 1; }

# Deploy
printf "\n%s\nDeploying project...\n" "$separator"
yarn deploy-rules
check_status "Rule Deployment"

yarn deploy
check_status "Hosting Deployment"

printf "\n%s\nScript completed successfully.\n%s\n" "$separator" "$separator"
