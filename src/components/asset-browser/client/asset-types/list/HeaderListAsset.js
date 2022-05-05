import React from "react";
import "./HeaderListAsset.css"

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
        if (this.props.className)
            className += ' ' + this.props.className;
        return <ul
            {...this.props}
            ref={this.ref.container}
            className={className}>
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
            .filter(elm => !elm.classList.contains('no-index'))
            .filter(elm => !current.contains(elm))

        if (elmList.length === 0)
            return;

        const root = {content: 'root', children: []}, lastByLevel = {0: root};
        for (const headerElm of elmList) {
            const {nodeName, id, textContent} = headerElm;
            const level = parseInt(nodeName.substring(1, 2));
            const liProps = {id, content: textContent, children: [], headerElm, level};
            lastByLevel[level] = liProps
            let target = lastByLevel[level - 1];
            target.children.push(liProps)
        }
        this.setState({
            list: root.children.map((child, i) => this.renderHeaderList(child, i))
        })
    }

    renderHeaderList({content, id, children, headerElm, level}, key) {
        return [
            <li className={'h' + level} key={key + 'li'}>
                <a
                    onClick={e => this.onClick(e, id)}
                    href={'#' + id}>{content}</a>
            </li>,
            (children && children.length > 0 ? <ul key={key + 'ul'}>
                {children.map((child, i) => this.renderHeaderList(child, i))}
            </ul> : null)
        ];
    }

    onClick(e, id) {
        const {current} = this.ref.container;
        const articleElm = current.closest('article, section, body');
        const hash = '#' + id;
        const headerElm = articleElm.querySelector(hash);
        e.preventDefault();
        window.history.pushState({}, '', hash);
        headerElm.scrollIntoView({block: "start", behavior: 'smooth'})
        headerElm.classList.add('highlighted')
        // setTimeout(() => headerElm.classList.remove('highlighted'), 1000);
        // setTimeout(() => , 1000);
    }
}

