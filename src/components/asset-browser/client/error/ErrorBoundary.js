import React from "react";
import "./ErrorBoundary.css"
import PropTypes from "prop-types";

export default class ErrorBoundary extends React.Component {
    /** Property validation **/
    static propTypes = {
        assetName: PropTypes.string,
    };

    constructor(props) {
        super(props);
        this.state = {hasError: false, error: null, errorInfo: null};
    }

    static getDerivedStateFromError(error) {
        return {hasError: true, error};
    }

    componentDidCatch(error, errorInfo) {
        this.setState({hasError: true, error, errorInfo})
        // console.error(error.message || error, error.stack, errorInfo.componentStack);
    }

    render() {
        const {hasError, error, errorInfo} = this.state;
        if (hasError) {
            // You can render any custom fallback UI
            return <div className="error-boundary">
                {this.props.assetName ? <h2>{this.props.assetName} Rendering Error</h2> : null}
                <h2 className="message">{error.message}</h2>
                <div className="stack">{error.stack}</div>
                <div className="stack">{errorInfo?.componentStack}</div>
            </div>;
        }

        return typeof this.props.children === "function" ? this.props.children() : this.props.children;
    }
}