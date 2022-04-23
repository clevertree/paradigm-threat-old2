#!/bin/bash
echo "Removing old dist";
rm -rf ./dist;
react-scripts build;
mv ./build ./dist