import React from "react";
import ReactDOM from "react-dom/client";
import "./HeaderListAsset.css"
import ErrorBoundary from "../../error/ErrorBoundary.js";

export default class HeaderListAsset extends React.Component {
    constructor(props) {
        super(props);
        this.ref = {
            container: React.createRef()
        }
    }

    componentDidMount() {
        this.updateHeaderList();
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        this.updateHeaderList();
    }

    render() {
        let className = 'asset header-list';
        if (this.props.className)
            className += ' ' + this.props.className;

        return <ErrorBoundary>
            <ul
                {...this.props}
                ref={this.ref.container}
                className={className}>
            </ul>
        </ErrorBoundary>
    }

    updateHeaderList() {
        const current = this.ref.container.current;
        const articleElm = current.closest('article, section, body');
        const list = articleElm.querySelectorAll('h1, h2, h3, h4, h5, h6');
        let root = {content: 'root', children: []}, lastByLevel = [root];
        [].forEach.call(list, (headerElm) => {
            if (headerElm.classList.contains('no-index'))
                return;
            const {nodeName, id, textContent} = headerElm;
            const level = parseInt(nodeName.substring(1, 2));
            const liProps = {id, content: textContent, children: [], headerElm, level};
            lastByLevel[level] = liProps;

            // Erase disconnected levels
            lastByLevel = lastByLevel.splice(0, level + 1);

            // Find parent
            let target;
            for (let i = level - 1; i >= 0; i--) {
                target = lastByLevel[i];
                if (target)
                    break;
            }

            target.children.push(liProps);
            headerElm.classList.add('header-target');
            headerElm.ondblclick = e => this.onClick(e, id);
        });
        current.reactContainer = current.reactContainer || ReactDOM.createRoot(current);
        const render = root.children.map((child, i) => this.renderHeaderChild(child, i));
        current.reactContainer.render(render);
    }

    renderHeaderChild({content, id, children, headerElm, level}, key) {
        return [
            <li className={'h' + level} key={key + 'li'}>
                <a
                    onClick={e => this.onClick(e, id)}
                    href={'#' + id}>{content}</a>
            </li>,
            (children && children.length > 0 ? <ul key={key + 'ul'}>
                {children.map((child, i) => this.renderHeaderChild(child, i))}
            </ul> : null)
        ];
    }

    onClick(e, id) {
        const {current} = this.ref.container;
        const articleElm = current.closest('article, section, body');
        const hash = '#' + id;
        const headerElm = articleElm.querySelector(`*[id='${id}']`);
        e.preventDefault();
        window.history.pushState({}, '', hash);
        headerElm.scrollIntoView({block: "start", behavior: 'smooth'})
        headerElm.classList.add('highlighted')
        setTimeout(() => headerElm.classList.remove('highlighted'), 4000);
    }
}
