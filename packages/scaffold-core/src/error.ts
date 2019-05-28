import path from "path"

export class LoadFromUrlError extends Error {

    constructor(url: string) {
        super(`Failed to load Scaffold from URL '${url}'.`)
    }

}

export class LoadFromFileError extends Error {

    constructor(url: string, filePath: string) {
        super(`Failed to load Scaffold from URL '${url}' from file '${path.relative(process.cwd(), filePath)}'.`)
    }

}
