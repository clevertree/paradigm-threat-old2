import React from "react";
import AssetRenderer from "../asset-types/asset-renderer/AssetRenderer.js";
import "./AssetSearch.css"
import {resolveAssetURL} from "../util/ClientUtil.js";

export default class AssetSearch extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            keywords: this.props.keywords,
            fileList: [],
            assetList: [],
            loading: true,
        }
        this.cb = {
            onFocus: e => this.onFocus(e),
            onChange: e => this.onChange(e),
            onSubmit: e => this.onSubmit(e),
        }
        this.ref = {
            form: React.createRef()
        }
        this.timeout = null
    }

    componentDidMount() {
        if (this.state.keywords)
            this.updateSearch(this.state.keywords);
    }
    

    render() {
        const {fileList, assetList, loading} = this.state;
        return <form onSubmit={this.cb.onSubmit}
                     ref={this.ref.form}>
            <fieldset className="asset-search">
                <label>Search: </label>
                <input name="search"
                       onFocus={this.cb.onFocus}
                       onChange={this.cb.onChange}
                       defaultValue={this.state.keywords.join(', ')}/>
                <button type="submit">Search</button>
            </fieldset>
            <article className={"search asset-spread"}>
                {!loading ? <ul>
                    <h2>Markdown Search Results:</h2>
                    {fileList.map((file, key) => <li key={key}>
                        <a href={file}>{new URL(file).pathname}</a>
                    </li>)}
                </ul> : null}
                <AssetRenderer>{assetList}</AssetRenderer>
            </article>
        </form>;
    }

    onChange() {
        clearTimeout(this.timeout);
        this.timeout = setTimeout(this.cb.onSubmit, 250)
    }

    onSubmit(e = null) {
        e && e.preventDefault();
        const {value} = this.ref.form.current.elements.search;
        const keywords = value.split(/[,;]+/g).filter(k => k).map(k => k.trim());
        this.updateSearch(keywords);
    }

    async updateSearch(keywords) {
        const {iterator} = this.props;
        const pathname = '/' + keywords.join('/')
        let assetList = keywords.join('').trim() ? iterator.searchByKeywords(keywords) : [];
        const fileList = assetList.filter(file => file.toLowerCase().endsWith('.md'));
        assetList = assetList.filter(file => !fileList.includes(file));
        this.setState({
            keywords,
            // fileList,
            assetList
        })

        if (keywords && keywords.join(""))
            await this.fetchFileList(keywords)
        window.history.pushState({}, '', pathname);

    }

    onFocus(e) {
        e.target.setSelectionRange(0, e.target.value.length)
    }

    async fetchFileList(keywords) {
        const assetURL = resolveAssetURL(process.env.REACT_APP_ASSET_ENDPOINT);
        this.setState({
            loading: true,
        });
        const response = await fetch(`${assetURL}?query={search(keywords:"${keywords.join(", ")}")}`);
        const {errors, data} = await response.json();
        if (errors)
            return errors.map(error => console.error(error.message));
        let fileList = data.search.map(result => resolveAssetURL(result));
        // fileList = this.state.fileList.concat(fileList);
        // fileList.filter((item, index) => fileList.indexOf(item) !== index);
        this.setState({
            loading: false,
            fileList
        })
    }
}