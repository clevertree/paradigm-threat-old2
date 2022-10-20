export const pathJoin = (...args) => {
    return (args[0] === '/' ? '/' : '') + args.map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/\/*$/g, '')
        } else {
            return part.trim().replace(/(^\/*|\/*$)/g, '')
        }
    }).filter(x => x.length).join('/')
}

export function resolveAssetURL(pathToAsset, relativePath) {
    if (!pathToAsset)
        throw new Error("Invalid Path: " + pathToAsset)
    if (pathToAsset.toLowerCase().startsWith('http'))
        return pathToAsset;
    const base = process.env.REACT_APP_ASSET_PUBLIC_ORIGIN || window.location.origin;
    if (relativePath && pathToAsset[0] !== '/')
        pathToAsset = pathJoin(relativePath, pathToAsset);
    return new URL(pathToAsset, base) + '';
}

export function scrollIntoViewPersistent(elm) {
    elm.scrollIntoView({block: "start", behavior: 'auto'})
    let intervalCount = 0;
    const intervalID = setInterval(() => {

        var top = elm.offsetTop;
        var height = elm.offsetHeight;

        const inView = (
            top < (window.pageYOffset + window.innerHeight) &&
            (top + height) > window.pageYOffset
        );
        intervalCount++;
        if (inView || intervalCount > 5) {
            clearInterval(intervalID);
        } else {
            elm.scrollIntoView({block: "start", behavior: 'smooth'})
        }

    }, 1000)
}