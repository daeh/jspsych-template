#!/usr/bin/env zsh

project=$1

source ${HOME}/.zshrc || { printf "Failed to activate zsh"; exit 1; }

conda activate sandbox || { printf "Failed to activate conda env\n"; exit 1; }

cd "${project}/scripts" || { printf "Failed to change directory to ${project}/scripts\n"; exit 1; }

### Update with your filenames and paths ###
python retrieve_data.py \
    --cred "myproject-firebase-adminsdk.json" \
    --out "${project}/data" \
    --collection 'exptData' 'sharedData' \
    --encrypted