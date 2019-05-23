import fs from "fs"
import https from "https"
import path from "path"
import urlUtil from "url"
import fetch from "node-fetch"

import { JSDOM } from "jsdom"
import prettier from "prettier"

export interface IScaffoldData {
    url: string
    template: string
}

export interface IScaffoldResult extends IScaffoldData {
    dom: JSDOM
}

export type Scaffold = {
    totalScaffolds: number
    currentScaffold: IScaffoldData
}

export type ScaffoldOptions = {
    filename: string
    casename: string
    fallback?: boolean
    writeback?: boolean
    loadStrategy?: "networkFirst" | "networkOnly" | "cacheFirst" | "cacheOnly" // TODO
    agent?: https.AgentOptions
}

export async function loadFromUrl(url: string, filePath: string, options: ScaffoldOptions): Promise<Scaffold> {
    const agent = new https.Agent(options.agent)
    const resp = await fetch(url, { agent })

    if (!resp.ok && options.fallback) {
        options.fallback = false
        return await loadFromFile(url, filePath, options)
    }

    const template = await resp.text()
    const scaffold = {
        url,
        template: prettier.format(template, { parser: "html" })
    }

    createOrUpdateFile(filePath, options, scaffold)

    return {
        totalScaffolds: 0,
        currentScaffold: scaffold,
    }
}

export async function loadFromFile(url: string, filePath: string, options: ScaffoldOptions): Promise<Scaffold> {
    const {casename} = options
    const scaffold: { [c: string]: IScaffoldData } = require(filePath)

    if (scaffold[casename] === undefined && options.fallback) {
        options.fallback = false
        return await loadFromUrl(url, filePath, options)
    // } else if (scaffold[casename] === undefined) {
    //     console.log(filePath)
    }

    return {
        totalScaffolds: Object.keys(scaffold).length,
        currentScaffold: scaffold[casename],
    }
}

export async function createOrUpdateFile(filePath: string, {casename, writeback}: ScaffoldOptions, data: IScaffoldData) {
    if (writeback !== true) { return }

    const scaffold = (fs.existsSync(filePath)) ? require(filePath) : {}
    scaffold[casename] = data

    let file = ``
    Object.keys(scaffold).forEach((scaffoldCase) => {
        file += `exports[\`${scaffoldCase}\`] = ${prettier.format(JSON.stringify(scaffold[scaffoldCase]), { parser: "json5" })}\n`
    })

    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, file, (err) => {
            if (err) { reject(err) }
            resolve()
        })
    })
}

export default async function (url: string, opts = {} as Partial<ScaffoldOptions>): Promise<IScaffoldResult> {
    const filename = opts.filename || (module.parent && module.parent.filename)
    const casename = opts.casename || (urlUtil.parse(url).pathname || url)

    if (filename === null) {
        throw new Error("Cannot determine Test Suite file name. Try specifiying it manually using the 'filename' option.")
    }

    const options = Object.assign({}, opts, { filename, casename, fallback: true })

    const scaffoldPath = path.join(path.dirname(filename), "__scaffolds__")
    const scaffoldFile = `${path.basename(filename, path.extname(filename))}.scaffold.js`
    const scaffoldLocation = path.join(scaffoldPath, scaffoldFile)

    const html = fs.existsSync(scaffoldLocation)
        ? await loadFromFile(url, scaffoldLocation, options)
        : await loadFromUrl(url, scaffoldLocation, options)

    const {template} = html.currentScaffold

    return {
        url,
        template,
        dom: new JSDOM(template, { url }),
    }
}
