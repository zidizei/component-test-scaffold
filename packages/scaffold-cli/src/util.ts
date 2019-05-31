import baseGlob from "glob"
import path from "path"

export async function glob(patterns: Array<string>): Promise<string[]> {
    const pattern = (patterns.length > 0) ? `+(${patterns.join("|")}).*` : "*"

    return new Promise((resolve, reject) => {
        baseGlob(path.resolve(`./**/__scaffolds__/${pattern}.scaffold.js`), (err, matches) => {
            if (err) { return reject(err) }
            resolve(matches)
        })
    })
}
