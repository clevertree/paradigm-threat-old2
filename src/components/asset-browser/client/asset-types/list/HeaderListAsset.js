import React from "react";

export default class HeaderListAsset extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            list: []
        }
        this.ref = {
            container: React.createRef()
        }
    }

    componentDidMount() {
        this.updateHeaderList()
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateHeaderList()
    }

    render() {
        let className = 'asset header-list';
        return <ul
            ref={this.ref.container}
            className={className} {...this.props}>
            {this.props.children}
            {this.state.list}
        </ul>
    }

    updateHeaderList(force = false) {
        if (!force && this.state.list.length !== 0)
            return;

        const {current} = this.ref.container;
        if (!current)
            console.error("Invalid container: ", this);

        const articleElm = current.closest('article, section, body');
        const elmList = [...articleElm.querySelectorAll('h1, h2, h3, h4, h5, h6')]

        const root = {content: 'root', children: []}, lastByLevel = {};
        for (const headerElm of elmList) {
            const {nodeName, id, textContent} = headerElm;
            const liProps = {id, content: textContent, children: []};
            const hID = parseInt(nodeName.substring(1, 2));
            lastByLevel[hID] = liProps
            let target = root;
            for (let j = 2; j <= hID; j++) {
                target = lastByLevel[j];
                if (!target) { // If sublevel doesn't exist
                    target = {content: null, children: []}
                    lastByLevel[j] = target;
                    lastByLevel[j - 1].children.push(target); // Add to previous level ???
                }
            }
            target.children.push(liProps)
        }
        console.log('headerElms', elmList, articleElm, root)
        this.setState({
            list: this.renderHeaderList({elmList, i: -1, curLevel: 1})
        })
    }

    renderHeaderList(stats) {
        const list = [];
        while (true) {
            stats.i++;
            let headerElm = stats.elmList[stats.i];
            if (!headerElm)
                break;
            const hID = parseInt(headerElm.nodeName.substring(1, 2));
            if (hID < stats.curLevel) {
                stats.curLevel--;
                break;
            } else if (hID === stats.curLevel) {
                stats.curLevel++;
                const subElms = this.renderHeaderList(stats);
                list.push(<li
                    className={'level' + hID}
                >
                    <a
                        href={'#' + headerElm.getAttribute('id')}
                    >{headerElm.textContent}</a>
                    {subElms ? <ul>{subElms}</ul> : null}
                </li>)
            } else {
                stats.curLevel++;
                list.push(<li
                    className={'level' + hID}
                >
                    <ul>{this.renderHeaderList(stats)}</ul>
                </li>)

            }
        }
        return list;
    }
}

