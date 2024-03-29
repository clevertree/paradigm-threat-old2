#!/bin/bash

echo "Pushing files to origin"
cd files || exit;
git push origin master -f || exit;
cd ..;

echo "Deploying to server"
ssh ari@paradigmthreat.net << EOF
cd /var/www/paradigm-threat-site/files;
git pull;
git reset --hard origin/master;
EOF