import https from "https"
import path from "path"

import { JSDOM } from "jsdom"

import { configure } from "./config"
import { loadUsingStrategy } from "./strategy"

export interface IScaffoldData {
    url: string
    test: string
    template: string
}

export interface IScaffoldResult {
    url: string
    template: string
    dom: JSDOM
}

export type Scaffold = {
    totalScaffolds: number
    currentScaffold: IScaffoldData
}

export type ScaffoldOptions = {
    filename: string
    casename: string
    writeback?: boolean
    loadStrategy?: "networkFirst" | "networkOnly" | "cacheFirst" | "cacheOnly" // TODO
    agent?: https.AgentOptions
}

export default async function (url: string, opts = {} as Partial<ScaffoldOptions>): Promise<IScaffoldResult> {
    const options = configure(url, opts, module.parent)

    const scaffoldPath = path.join(path.dirname(options.filename), "__scaffolds__")
    const scaffoldFile = `${path.basename(options.filename, path.extname(options.filename))}.scaffold.js`
    const scaffoldLocation = path.join(scaffoldPath, scaffoldFile)

    const html = await loadUsingStrategy(url, scaffoldLocation, options)
    const {template} = html.currentScaffold

    return {
        url,
        template,
        dom: new JSDOM(template, { url }),
    }
}
