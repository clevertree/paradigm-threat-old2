import React from "react";
import {resolveAssetURL} from "../../util/ClientUtil.js";

export default class HitCounter extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loaded: false,
            content: null
        }
    }

    componentDidMount() {
        this.loadContent().then();
    }

    async loadContent() {
        if(!asyncCall)
            asyncCall = loadUniqueVisitors()
        const content = await asyncCall;
        this.setState({content});
    }
    render() {
        return 'TODO: hit counter ' + this.state.content;
    }
}

let asyncCall = null;
async function loadUniqueVisitors() {
    const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
    const response = await fetch(assetURL + '?query={report(path:"general.unique_visitors")}');
    const {data: {report}} = await response.json();
    return report;
}