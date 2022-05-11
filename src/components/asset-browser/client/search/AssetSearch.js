import React from "react";
import AssetRenderer from "../asset-types/asset-renderer/AssetRenderer.js";
import "./AssetSearch.css"

export default class AssetSearch extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keywords: this.props.keywords
        }
        this.cb = {
            onFocus: e => this.onFocus(e),
            onChange: e => this.onChange(e)

        }
        this.timeout = null
    }

    render() {
        const {iterator} = this.props;
        const {keywords} = this.state;
        const fileList = keywords.join('').trim() ? iterator.searchByKeywords(keywords) : [];
        return <>
            <fieldset className="asset-search">
                <label>Search: </label>
                <input name="search"
                       onFocus={this.cb.onFocus}
                       onChange={this.cb.onChange}
                       defaultValue={this.state.keywords.join(', ')}/>
                <button type="submit">Search</button>
            </fieldset>
            <article className={"search asset-spread"}>
                <AssetRenderer>{fileList}</AssetRenderer>
            </article>
        </>;
    }

    onChange(e) {

        clearTimeout(this.timeout);
        this.timeout = setTimeout(() => {
            const {value} = e.target;
            const keywords = value.split(/[,;\s]+/g).filter(k => k);
            const pathname = '/' + keywords.join('/')
            this.setState({
                keywords
            })
            window.history.pushState({}, '', pathname);
        }, 250)
    }

    onFocus(e) {
        e.target.setSelectionRange(0, e.target.value.length)
    }
}