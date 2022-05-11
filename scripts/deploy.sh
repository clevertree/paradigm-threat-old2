#!/bin/bash

npm run test || exit;

echo "Pushing to origin"
git push origin master || exit;
git push github master -f;

echo "Pushing files to origin"
cd files || exit;
git push origin master || exit;
cd ..;

echo "Deploying to server"
ssh git.paradigmthreat.net << EOF
cd /var/www/paradigm-threat-site;
git stash;
git pull;
git reset --hard origin/master;

npm run test || exit;

npm run build;

pm2 restart "Paradigm Threat Server"

cd /var/www/paradigm-threat-files;
git pull;
EOF