#!/bin/bash
react-scripts build || exit;
echo "Removing old dist";
rm -rf ./dist;
echo "Renaming build to dist";
mv ./build ./dist