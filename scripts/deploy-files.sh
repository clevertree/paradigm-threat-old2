#!/bin/bash

echo "Pushing files to origin"
cd files || exit;
git push origin master -f || exit;
cd ..;

echo "Deploying to server"
ssh git.paradigmthreat.net << EOF
cd /var/www/paradigm-threat/files;
git pull;
git reset --hard origin/master;
EOF