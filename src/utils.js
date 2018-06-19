//@flow

export const addHeadSlash = (path: string) =>
    path[0] === '/' ? path : '/' + path

export const removeTrailingSlash = (path: string) =>
    path.slice(-1) === '/' ? path.slice(0, -1) : path

export const removeHeadSlash = (path: string) =>
    path[0] === '/' ? path.slice(1) : path

export const queryFreePath = (path: string) =>
    path.split('?')[0]

export const pathToIdString = (path: string) =>
    removeHeadSlash(removeTrailingSlash(queryFreePath(path)))


export function pathToIds(path: string): string[] {
    const
        idsString = pathToIdString(path)
    return idsString ? idsString.split('/') : []
}
