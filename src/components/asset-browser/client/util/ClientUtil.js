export const pathJoin = (...args) => {
    return args.map((part, i) => {
        if (i === 0) {
            return part.trim().replace(/\/*$/g, '')
        } else {
            return part.trim().replace(/(^\/*|\/*$)/g, '')
        }
    }).filter(x => x.length).join('/')
}

export function resolveAssetURL(pathToAsset, relativePath) {
    if (pathToAsset.toLowerCase().startsWith('http'))
        return pathToAsset;
    const base = process.env.REACT_APP_ASSET_PUBLIC_URL || window.location.origin;
    if (relativePath && pathToAsset[0] !== '/')
        pathToAsset = pathJoin(relativePath, pathToAsset);
    return new URL(pathToAsset, base) + '';
}