import fs from "fs"
import https from "https"

import fetch from "node-fetch"
import prettier from "prettier"

import { Scaffold, ScaffoldOptions, IScaffoldData } from "."
import { LoadFromFileError, LoadFromUrlError } from "./error"

export async function loadFromUrl(url: string, filePath: string, options: ScaffoldOptions): Promise<Scaffold> {
    const {casename, filename} = options
    const agent = new https.Agent(options.agent)
    const resp = await fetch(url, { agent })

    if (!resp.ok) {
        throw new LoadFromUrlError(url)
    }

    const template = await resp.text()
    const scaffold: IScaffoldData = {
        url,
        filename,
        casename,
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

    if (scaffold[casename] === undefined) {
        throw new LoadFromFileError(url, filePath)
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
