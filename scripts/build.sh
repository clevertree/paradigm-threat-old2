#!/bin/bash
echo "Removing old dist";
react-scripts build || exit;
rm -rf ./dist;
mv ./build ./dist