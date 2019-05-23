import urlUtil from "url"

import { ScaffoldOptions } from "."

const getFilenameFromModule = (parent: NodeModule | null) => parent && parent.filename

const getCasenameFromUrl = (url: string) => {
    const pathname = urlUtil.parse(url).pathname

    return (pathname === undefined || pathname === "/") ? url : pathname
}

export function configure(url: string, opts: Partial<ScaffoldOptions>, parent: NodeModule | null): ScaffoldOptions {

    const filename = opts.filename || getFilenameFromModule(parent)
    const casename = opts.casename || getCasenameFromUrl(url)

    if (filename === null) {
        throw new Error("Cannot determine Test Suite file name. Try specifiying it manually using the 'filename' option.")
    }

    return Object.assign({}, opts, { filename, casename, fallback: true })
}
