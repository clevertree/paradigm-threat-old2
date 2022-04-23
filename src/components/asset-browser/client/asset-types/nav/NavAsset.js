import React from "react";
import AssetBrowserContext from "../../context/AssetBrowserContext.js"

import "./NavAsset.css"
import PropTypes from "prop-types";

export default class NavAsset extends React.Component {
    /** Property validation **/
    static propTypes = {
        homeShow: PropTypes.bool.isRequired,
        homeName: PropTypes.string.isRequired
    };

    static defaultProps = {
        homeShow: true,
        homeName: 'home'
    }

    constructor(props) {
        super(props);
        this.ref = {
            nav: React.createRef(),
            container: React.createRef(),
            bottomText: React.createRef()
        }
        this.cb = {
            onScroll: e => this.updateScrollPosition(e),
            scrollToTop: e => this.scrollToTop(e)
        }
        this.state = {
            floating: false
        }
    }

    componentDidMount() {
        window.addEventListener('scroll', this.cb.onScroll)
    }

    componentWillUnmount() {
        window.removeEventListener('scroll', this.cb.onScroll)
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const navElm = this.ref.nav.current;
        const containerElm = this.ref.container.current;
        const bottomElm = this.ref.bottomText.current;
        if (this.state.floating) {
            const {height: containerHeight} = containerElm.getBoundingClientRect();
            const {height: bottomHeight} = bottomElm.getBoundingClientRect();
            navElm.setAttribute('style', `height: ${containerHeight}px`);
            document.body.style.paddingBottom = `${bottomHeight}px`;
        } else {
            navElm.removeAttribute('style');
            document.body.style.paddingBottom = null
        }
    }

    render() {
        let className = "asset-navigation";
        if (this.state.floating)
            className += ' floating';
        return <AssetBrowserContext.Consumer>
            {({iterator, pathname, loaded}) => <nav
                ref={this.ref.nav}
                className={className}>
                <div className="nav-container"
                     ref={this.ref.container}
                >
                    {this.renderLinks(pathname, iterator, loaded)}
                </div>
                {this.state.floating ? <div
                    className="bottom-text"
                    onClick={this.cb.scrollToTop}
                    ref={this.ref.bottomText}
                >Back to top</div> : null}
            </nav>}
        </AssetBrowserContext.Consumer>;
    }

    renderLinks(pathname, iterator, loaded) {
        let generate = loaded && (this.props['data-generate-links'] || this.props['generate-links']);
        return <>
            <div className="main">
                {this.props.children}
                {this.props.homeShow ? this.renderAnchorLink("", "", 'home', this.props.homeName) : null}
                {generate ? this.renderGeneratedMainLinks(iterator) : null}
            </div>
            {generate ? this.renderGeneratedSubLinks(pathname, iterator) : null}
        </>
    }

    renderGeneratedMainLinks(iterator) {

        const fileList = iterator.listDirectories('/')
        return fileList
            .filter(file => !file.startsWith('@'))
            .map((file, i) => this.renderAnchorLink("", file, i))
    }

    renderGeneratedSubLinks(pathname, iterator) {
        let subPath = pathname;
        let content = [], i = 0;
        while (subPath && subPath !== '/') {
            const currentSubPath = subPath;
            // console.log('subPath', subPath, pathname);
            if (i++ > 10)
                break;
            const fileList = iterator.listDirectories(subPath);
            if (fileList.length !== 0)
                content.unshift(
                    <div className={"sub"} key={subPath}>
                        {fileList
                            .filter(file => !file.startsWith('@'))
                            .map((file, i) => this.renderAnchorLink(currentSubPath, file, i))}
                    </div>
                )
            subPath = subPath.substring(0, subPath.lastIndexOf("/"));
        }
        return content;
    }

    renderAnchorLink(subPath, file, key, name = null) {
        const relativePath = subPath + '/' + file;
        if (!name) name = file.split('/').pop();
        name = name.replace(/_+/g, ' ');
        const {pathname} = document.location;
        const selected = relativePath === '/' ? relativePath === pathname : pathname.startsWith(relativePath);
        return <a
            className={selected ? 'selected' : null}
            href={relativePath}
            key={key}>{name}</a>
    }


    updateScrollPosition() {
        const navElm = this.ref.nav.current;
        const {top, height} = navElm.getBoundingClientRect();
        const floating = top < 0;
        if (this.state.floating !== floating) {
            this.setState({floating, height: floating ? height : 0})
        }
        return floating;
    }


    scrollToTop() {
        window.scroll({
            top: 0,
            left: 0,
            behavior: 'smooth'
        });
    }
}
