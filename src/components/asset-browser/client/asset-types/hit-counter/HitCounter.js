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

        const assetURL = new URL(process.env.REACT_APP_ASSET_HITCOUNT_ENDPOINT, process.env.REACT_APP_ASSET_PUBLIC_URL || window.location.origin);
        const response = await fetch(assetURL + '');
        const responseJSON = await response.json()
        console.log("Content loaded: ", responseJSON);
        this.setState({loaded: true, content:responseJSON})
    }
    render() {
        return 'TODO: hit counter'
    }
}

