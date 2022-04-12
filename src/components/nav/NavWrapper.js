import React, {Component} from "react";
import {withRouter} from 'react-router-dom';
import PropTypes from "prop-types";

export default class NavWrapper extends Component {
    static propTypes = {
        window: PropTypes.object.isRequired
    }

    constructor(props) {
        super(props);
        console.log('NavWrapper', props);
        const windowObj = props.target || window;
        this.state = {
            pathname: windowObj.location.pathname
        }
        this.listener = {
            onClick: e => this.onClick(e)
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.listener.onClick);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.listener.onClick);
    }


    render() {
        const windowObj = this.props.target || window;
        const { history, location, match } = windowObj;
        const newProps = { history, location, match };
        // console.log("NAVWRAPPER", newProps.location.pathname);
        return React.cloneElement(this.props.children, newProps);
    }


    onClick(e) {
        const windowObj = this.props.target || window;
        let target = e.target;
        while (target && target.nodeName.toLowerCase() !== 'a') {
            target = target.parentNode;
        }
        if (target
            && target.nodeName.toLowerCase() === 'a'
            && target.target !== '_blank') {
            // console.log("Click target: ", target);

            const url = new URL(target.href);
            if (url.origin !== windowObj.location.origin) {
                target.setAttribute('target', '_blank');
                // Allow navigation
            } else if (url.hash
                || url.pathname.endsWith('.pdf')
            ) {
                // Allow local navigation

            } else {
                e.preventDefault();
                windowObj.history.pushState({}, '', url.pathname);
                this.setState({
                    pathname: url.pathname
                })
                windowObj.scroll({
                    top: 0,
                    left: 0,
                    behavior: 'smooth'
                });
            }
        }
    }
}

