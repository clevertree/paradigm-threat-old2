import React from "react";
import AssetBrowserContext from "../../AssetBrowserContext.js"

import "./NavAsset.css"

export default class NavAsset extends React.Component {

    render() {
        return <AssetBrowserContext.Consumer>
            {({iterator, pathname, loaded}) => <nav className="asset-navigation">
                {this.renderLinks(pathname, iterator, loaded)}
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
            console.log('subPath', subPath, pathname);
            if(i++>10)
                break;
            const fileList = iterator.listDirectories(subPath);
            if(fileList.length !== 0)
            content.push(
                <div className={"sub sub"+i} key={subPath}>
                    {fileList.map((file, i) => <a href={subPath + '/' + file} key={i}>{file}</a>)}
                </div>
            )
            subPath = subPath.substring(0, subPath.lastIndexOf("/"));
        }
        return content;
    }

}
