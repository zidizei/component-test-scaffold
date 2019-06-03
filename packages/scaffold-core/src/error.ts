import path from "path"

export class LoadFromUrlError extends Error {

    name = "LoadFromUrlError"

    constructor(url: string) {
        super(`Failed to load Scaffold from URL '${url}'.`)
    }

}

export class LoadFromFileError extends Error {

    name = "LoadFromFileError"

    constructor(url: string, filePath: string) {
        super(`Failed to load Scaffold from URL '${url}' from file '${path.basename(filePath)}'.`)
    }

}
