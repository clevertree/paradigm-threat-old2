#!/bin/bash

npm run test || exit;

git push gitbucket master;

ssh git.paradigmthreat.net << EOF
cd /var/www/paradigm-threat;
git stash;
git pull;
git reset --hard origin/master;
npm run test || exit;
npm run build;
pm2 restart paradigm-threat
EOF