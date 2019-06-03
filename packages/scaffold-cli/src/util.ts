import baseGlob from "glob"
import path from "path"
import chalk from "chalk"
import console from "console"

export async function glob(patterns: Array<string>): Promise<string[]> {
    const pattern = (patterns.length > 0) ? `+(${patterns.join("|")}).*` : "*"
    const globPath = path.resolve(`./**/__scaffolds__/${pattern}.scaffold.js`)

    return new Promise((resolve, reject) => {
        baseGlob(globPath, { ignore: ["**/node_modules/**"] }, (err, matches) => {
            if (err) { return reject(err) }
            resolve(matches)
        })
    })
}

export const log = {
    verbose(msg: string): void {
        console.log(chalk.gray(msg))
    },

    info(msg: string): void {
        console.log(chalk.whiteBright(msg))
    },

    error(e: Error): void {
        const type = chalk.red.bold(e.name)
        const message = chalk.red(e.message)

        console.error(chalk.whiteBright("⚠️ Could not update Scaffold file(s).\n"))
        console.error(`${type}\n${message}`)
    }
}
