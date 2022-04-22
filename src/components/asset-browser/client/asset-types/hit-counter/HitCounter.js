import React from "react";
import {resolveAssetURL} from "../../util/ClientUtil.js";

export default class HitCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            content: null
        }
        this.interval = null;
    }

    componentDidMount() {
        this.loadContent().then();
        this.interval = setInterval(() => this.loadContent(true), 60 * 60 * 1000);
    }

    componentWillUnmount() {
        clearInterval(this.interval);
    }

    async loadContent(force = false) {
        if (!asyncCall || force)
            asyncCall = loadUniqueVisitors()
        const content = await asyncCall;
        this.setState({content});
    }

    render() {
        return <a href={resolveAssetURL(process.env.REACT_APP_ASSET_SITE_DIRECTORY + '/report.html')}>
            {this.state.content} Visitors
        </a>;
    }
}

let asyncCall = null;

async function loadUniqueVisitors() {
    const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
    const response = await fetch(assetURL + '?query={report(path:"general.unique_visitors")}');
    const {data: {report}} = await response.json();
    return report;
}