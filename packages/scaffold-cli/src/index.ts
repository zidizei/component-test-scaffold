import chalk from "chalk"
import path from "path"

import writeBackScaffold, { IScaffoldData } from "component-test-scaffold"

import { Parsed } from "./cli"
import { glob, log } from "./util"

type Summary = {
    files: number
    hasError?: boolean
}

export async function update(patterns: Array<string>, {verbose}: Parsed): Promise<Summary> {
    const matches = await glob(patterns)
    const summary = {
        files: matches.length,
        hasError: false,
    }

    log.info(`Updating ${chalk.bold(matches.length.toString())} Scaffold ${matches.length === 1 ? "file" : "files"}.`)

    if (patterns.length > 0) {
        log.info(`Matching patterns: ${chalk.bold(patterns.join(", "))}`)
    }

    try {
        await updateScaffolds(matches, verbose)
    } catch (e) {
        summary.hasError = true
        log.error(e)
    }

    return summary
}

async function updateScaffolds(matches: string[], verbose?: boolean) {
    const writeScaffolds = async (scaffolds: { [c: string]: IScaffoldData }, filePath: string, verbose?: boolean) => {
        const updates = Object.keys(scaffolds).map((casename) => {
            const {url, test} = scaffolds[casename]

            if (verbose) {
                log.verbose("Updating '" + casename + "'.")
            }

            return writeBackScaffold(url, {
                casename,
                filename: path.resolve(path.dirname(filePath), test),
                writeback: true,
                loadStrategy: "networkOnly"
            })
        })

        return Promise.all(updates)
    }

    const files = matches.map((filePath) => {
        const scaffold: { [c: string]: IScaffoldData } = require(filePath)
        return writeScaffolds(scaffold, filePath, verbose)
    })

    return Promise.all(files)
}
