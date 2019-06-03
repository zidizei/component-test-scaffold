import yargs from "yargs"

import { update } from "./index"
import version from "./version"

const CLI_VERSION = version()
const CLI_USAGE = "Usage: $0 [patterns..]"
const CLI_OPTS = {
    verbose: {
        demandOption: false,
        describe: "Show more details for updated scaffold files",
        type: 'boolean' as 'boolean',
    }
}

export type Parsed = {
    [x: string]: unknown
    verbose: boolean | undefined
    $0: string
}

export async function run(argv?: Array<string>) {
    argv = argv || process.argv.slice(2)

    const {_: patterns, ...parsed} = yargs(argv)
        .usage(CLI_USAGE)
        .options(CLI_OPTS)
        .version(CLI_VERSION)
        .alias("h", "help")
        .argv

    update(patterns, parsed)
}
