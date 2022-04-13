import * as React from "react";
import Markdown from 'markdown-to-jsx';
import PropTypes from "prop-types";

/** @deprecated  Move to assetTypes **/

export default class MarkdownContentLoader extends React.Component {
    /** Property validation **/
    static propTypes = {
        file: PropTypes.string.isRequired,
    };

    static defaultProps = {
        className: "markdown-body"
    }

    constructor(props) {
        super(props);
        this.state = {
            content: null,
            loaded: false
        }
        this.options = {
            overrides: {
                img: (props) => this.renderTag('img', props),
                ...props.overrides
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (prevProps.file !== this.props.file) {
            // console.log("Reloading content: ", this.props.file);
            this.loadContent().then();
        }
    }

    componentDidMount() {
        // console.log("Loading content: ", this.props.file);
        this.loadContent().then();
    }

    async loadContent() {
        const filePath = this.props.file;
        const response = await fetch(filePath);
        const content = await response.text()
        this.setState({content, loaded: true});
    }

    render() {
        return (
            <Markdown options={this.options} {...this.props} file={null}>
                {this.state.loaded ? this.state.content : "Loading Markdown page: " + this.props.file}
            </Markdown>
        );
    }

    renderTag(tagName, props) {
        let finalProps = props;
        if(props.class) {
            finalProps = {...props};
            finalProps.className = finalProps.class;
            delete finalProps.class;
        }
        // switch(tagName) {
        //     case 'img':
        // }
        return React.createElement(tagName, finalProps);
    }
}
