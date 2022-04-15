import React from "react";
import AssetBrowserContext from "../../AssetBrowserContext.js"

import "./NavAsset.css"

export default class NavAsset extends React.Component {
    constructor(props) {
        super(props);
        this.ref = {
            nav: React.createRef(),
            container: React.createRef()
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
        const {height: containerHeight} = containerElm.getBoundingClientRect();
        if(containerHeight) navElm.setAttribute('style', `height: ${containerHeight}px`);
    }

    render() {
        let className = "asset-navigation";
        if(this.state.floating)
            className += ' floating';
        return <AssetBrowserContext.Consumer>
            {({iterator, pathname, loaded}) => <nav
                ref={this.ref.nav}
                className={className}>
                <div className="nav-container" ref={this.ref.container}>
                {this.renderLinks(pathname, iterator, loaded)}
                </div>
                {this.state.floating ? <div
                    className="bottom-text"
                    onClick={this.cb.scrollToTop}
                >Back to top</div> : null}
            </nav>}
        </AssetBrowserContext.Consumer>;
    }

    renderLinks(pathname, iterator, loaded) {
        let generate = loaded && (this.props['data-generate-links'] || this.props['generate-links']);
        return <>
            <div className="main">
                {this.props.children}
                {generate ? this.renderGeneratedMainLinks(iterator) : null}
            </div>
                {generate ? this.renderGeneratedSubLinks(pathname, iterator) : null}
        </>
    }

    renderGeneratedMainLinks(iterator) {

        const fileList = iterator.listDirectories('/')
        return fileList.map((file, i) => <a href={'/' + file} key={i}>{file}</a>)
    }

    renderGeneratedSubLinks(pathname, iterator) {
        let subPath = pathname;
        let content = [], i=0;
        while(subPath && subPath !== '/') {
            // console.log('subPath', subPath, pathname);
            if(i++>10)
                break;
            const fileList = iterator.listDirectories(subPath);
            if(fileList.length !== 0)
            content.unshift(
                <div className={"sub"} key={subPath}>
                    {fileList.map((file, i) => <a href={subPath + '/' + file} key={i}>{file}</a>)}
                </div>
            )
            subPath = subPath.substring(0, subPath.lastIndexOf("/"));
        }
        return content;
    }


    updateScrollPosition(e) {
        const navElm = this.ref.nav.current;
        const {top, height, y} = navElm.getBoundingClientRect();
        const floating = top < 0;
        if(this.state.floating !== floating) {
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