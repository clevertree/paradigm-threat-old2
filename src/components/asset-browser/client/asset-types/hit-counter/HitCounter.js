import React from "react";

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

        const assetURL = new URL(process.env.REACT_APP_ASSET_ENDPOINT, process.env.REACT_APP_ASSET_PUBLIC_URL || window.location.origin);
        const response = await fetch(assetURL + '?query={report(path:"general.unique_visitors")}');
        const {data: {report}} = await response.json()
        console.log("Content loaded: ", report);
        this.setState({loaded: true, content:report})
    }
    render() {
        return 'TODO: hit counter ' + this.state.content;
    }
}

