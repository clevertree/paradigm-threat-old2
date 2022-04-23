import React from "react";
import PropTypes from "prop-types";

export default class UnknownAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        src: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {
            content: null,
            loaded: false
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.src !== this.props.src) {
            this.loadContent().then();
        }
        if (prevProps.refreshHash !== this.props.refreshHash) {
            this.loadContent().then();
        }
    }

    componentDidMount() {
        if (this.props.render) {
            // console.log("Loading content: ", this.props.file);
            this.loadContent().then();
        }
    }

    async loadContent() {
        const filePath = this.props.src;
        const response = await fetch(filePath);
        const content = await response.text()
        this.setState({content, loaded: true});
    }


    render() {
        let className = 'asset-unknown asset';
        if (this.props.className)
            className += ' ' + this.props.className;
        return (
            <div className={className}>
                <a className="title" href={this.props.src}>Unknown Asset: {this.props.src.split('/').pop()}</a>
                {this.props.render ? <>
                    <br/>
                    {this.state.loaded ? this.state.content : "Loading Asset: " + this.props.src}
                </> : null}
            </div>
        );
    }
}

