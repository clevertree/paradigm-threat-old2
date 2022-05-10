import React from "react";
import "./ErrorBoundary.css"

export default class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = {hasError: false};
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return {hasError: true, error};
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        console.error(error, errorInfo, this.props?.children?.props);
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return <div className="error-boundary">
                {this.props.assetName ? <h2>{this.props.assetName} Rendering Error</h2> : null}
                <div className="stack">{this.state.error.stack}</div>
            </div>;
        }

        return this.props.children;
    }
}