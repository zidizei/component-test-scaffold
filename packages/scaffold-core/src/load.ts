import fs from "fs"
import path from "path"
import http from "http"
import https from "https"
import urlUtil from "url"

import fetch from "node-fetch"
import prettier from "prettier"

import { Scaffold, ScaffoldOptions, IScaffoldData } from "."
import { LoadFromFileError, LoadFromUrlError } from "./error"

export async function loadFromUrl(url: string, filePath: string, options: ScaffoldOptions): Promise<Scaffold> {
    const {filename, agent} = options

    const parsedUrl = urlUtil.parse(url)
    const httpAgent = new http.Agent(agent)
    const httpsAgent = new https.Agent(agent)

    const resp = await fetch(url, { agent: (parsedUrl.protocol === "https:") ? httpsAgent : httpAgent })

    if (!resp.ok) {
        throw new LoadFromUrlError(url)
    }

    const template = await resp.text()
    const scaffold: IScaffoldData = {
        url,
        test: path.relative(path.dirname(filePath), filename),
        template: prettier.format(template, { parser: "html" })
    }

    await createOrUpdateFile(filePath, options, scaffold)

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

    const mkdir = async (dp: string) => {
        return new Promise<string>((resolve, reject) => {
            fs.mkdir(path.dirname(dp), (err) => {
                if (err && err.code !== "EEXIST") { return reject(err) }
                resolve(dp)
            })
        })
    }

    const write = async (fp: string) => {
        return new Promise((resolve, reject) => {
            fs.writeFile(fp, file, (err) => {
                if (err) { return reject(err) }
                resolve()
            })
        })
    }

    return mkdir(filePath).then(write)
}
