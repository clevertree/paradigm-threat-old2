import React, {Component} from "react";
import PropTypes from "prop-types";
import {scrollIntoViewPersistent} from "../asset-browser/client/util/ClientUtil.js";

export default class NavWrapper extends Component {
    static propTypes = {
        window: PropTypes.object
    }

    constructor(props) {
        super(props);
        // console.log('NavWrapper', props);
        const windowObj = props.target || window;
        this.state = {
            pathname: windowObj.location.pathname
        }
        this.listener = {
            onClick: e => this.onClick(e),
            onPopState: e => this.onPopState(e)
        }
    }

    componentDidMount() {
        document.addEventListener('click', this.listener.onClick);
        window.addEventListener('popstate', this.listener.onPopState);
    }

    componentWillUnmount() {
        document.removeEventListener('click', this.listener.onClick);
        window.removeEventListener('popstate', this.listener.onPopState);
    }


    render() {
        const windowObj = this.props.target || window;
        const newProps = {pathname: windowObj.location.pathname || ''};
        // console.log("NAVWRAPPER", windowObj.location.pathname);
        return React.cloneElement(this.props.children, newProps);
    }


    onClick(e) {
        // console.log(e);
        const windowObj = this.props.target || window;
        let target = e.target;
        while (target && target.nodeName.toLowerCase() !== 'a') {
            target = target.parentNode;
        }
        if (target
            && target.nodeName.toLowerCase() === 'a'
            && target.target !== '_blank') {

            const url = new URL(target.href);
            if (url.origin !== windowObj.location.origin) {
                target.setAttribute('target', '_blank');
                // Allow navigation
            } else if (url.hash
                || url.pathname.endsWith('.pdf')
                || url.pathname.endsWith('.html') // TODO: hack fix!
            ) {
                // Allow local navigation
                const idString = url.hash.substring(1);
                const headerElm = [].find.call(document.querySelectorAll('h1, h2, h3, h4, h5, h6'), header => header.getAttribute('id') === idString);
                if (headerElm) {
                    e.preventDefault();
                    scrollIntoViewPersistent(headerElm);
                }
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

    onPopState(e) {
        const {pathname} = window.location;
        this.setState({
            pathname
        })
    }
}

