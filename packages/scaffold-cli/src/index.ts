import load, { IScaffoldData } from "@component-test/scaffold-core"

import { Parsed } from "./cli"
import { glob } from "./util"

type Summary = {
    files: number
}

export async function update(patterns: Array<string>, {verbose}: Parsed): Promise<Summary> {
    const matches = await glob(patterns)
    const summary = {
        files: matches.length
    }

    await matches.forEach(async (filePath) => {
        const scaffold: { [c: string]: IScaffoldData } = require(filePath)
        const updates = Object.keys(scaffold).map((casename) => {
            const cas = scaffold[casename]

            if (verbose) {
                console.log("Updating '" + casename + "'.")
            }

            return load(cas.url, {
                filename: cas.test,
                casename,
                writeback: true,
                loadStrategy: "networkOnly"
            })
        })

        await Promise.all(updates)
    })

    return summary
}
