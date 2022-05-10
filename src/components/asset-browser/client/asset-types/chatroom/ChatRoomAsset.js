import React from "react";

import "./ChatRoomAsset.css";
import ErrorBoundary from "../../error/ErrorBoundary.js";


// TODO prevent stolen focus
export default class ChatRoomAsset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false
        }
        this.ref = {
            container: React.createRef()
        }
        this.cb = {
            onScroll: e => this.onScroll(e)
        }
    }

    componentDidMount() {
        this.reload();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        if (!this.state.visible)
            this.reload();
    }

    shouldComponentUpdate(nextProps, nextState, nextContext) {
        // Once visible, stay loaded and don't refresh
        return !this.state.visible && nextState.visible;
    }

    reload() {
        window.removeEventListener('scroll', this.cb.onScroll)
        setTimeout(() => {
            window.addEventListener('scroll', this.cb.onScroll)
            this.cb.onScroll();
        }, 1000)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.cb.onScroll)
    }

    render() {
        const {href} = this.props;
        const absURL = new URL(href || '', process.env.REACT_APP_ASSET_ASSET_CHATROOM_ORIGIN)
        return <ErrorBoundary>
            <div className="asset chatroom"
                 ref={this.ref.container}
            >
                {this.state.visible ? <iframe title="Chat Server" src={absURL}></iframe> :
                    <div className="placeholder"/>}
                <a href={absURL} target="_blank" rel="noreferrer">Open Chat in new window</a>
            </div>
        </ErrorBoundary>
    }

    onScroll(e) {
        const {current} = this.ref.container;
        if (current) {
            const rect = current.getBoundingClientRect();
            const visible = (rect.top >= 0) && (rect.bottom <= window.innerHeight);
            if (visible) {
                this.setState({visible})
                window.removeEventListener('scroll', this.cb.onScroll)
            }
        }
    }
}

