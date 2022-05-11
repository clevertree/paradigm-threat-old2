# Paradigm Threat Website

## Install your SSH Key

1. Go to https://git.pthreat.co
2. Create a user and/or log in
3. Go to your profile section and add your SSH Key

## Clone the Repo:

### `git clone ssh://git@git.pthreat.co:2222/ari/paradigm-threat-site.git --recursive`

## Install Files Submodule

If you already cloned the project and didn't use --recurse-submodules,
you can combine the git submodule init and git submodule update steps by running

### `git submodule update --init`

## Available Scripts

In the project directory, you can run:

### `npm build`

Builds the app. This is necessary for running the server\
Open [http://localhost:8081](http://localhost:8081) to view it in the browser.

### `npm run server`

Runs the production server. Running this is necessary for the files to load\
Open [http://localhost:8081](http://localhost:8081) to view it in the browser.

### `npm start`

For developers, Run the app in development mode. This uses the above server for loading files.\
Open [http://localhost:3000](http://localhost:3000) to view it in the browser.

The page will reload if you make edits.\
You will also see any lint errors in the console.

Note:

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more
information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

`Note: The server will server the react client, as well as all the hosted files`

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).
