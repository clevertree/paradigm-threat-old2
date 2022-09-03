import React from "react";

import "./ChangeLogAsset.css";
import ErrorBoundary from "../../error/ErrorBoundary.js";
import {resolveAssetURL} from "../../util/ClientUtil.js";

const fetchChangeLog = (async function () {
    const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
    const response = await fetch(assetURL + '?query={changeLog}');
    const {data: {changeLog}} = await response.json();
    return changeLog;
})()

// TODO prevent stolen focus
export default class ChangeLogAsset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            status: 'loading',
            error: null,
            changeLog: []
        }
        this.ref = {
            container: React.createRef()
        }
        console.log('fetch', this.fetch)
    }

    componentDidMount() {
        fetchChangeLog.then(changeLog => {
            this.setState({changeLog, status: 'loaded'})
        }).catch(e => {
            this.setState({changeLog: [], error: e + '', status: 'error'})
        })
    }


    render() {
        return <ErrorBoundary>
            {this.state.status === 'loaded' ? this.renderChangeLog() :
                <div className="placeholder"/>}
        </ErrorBoundary>
    }

    renderChangeLog() {
        const {href} = this.props;
        const absURL = new URL(href || '', process.env.REACT_APP_ASSET_ASSET_GIT_HASH_URL)
        return <ul className="list" ref={this.ref.container}>
            {this.state.changeLog.map(entry => <li>
                <a href={absURL + entry.hash}>{new Date(entry.date).toLocaleDateString("en-US")} - {entry.message}</a>
            </li>)}
        </ul>
    }

}
