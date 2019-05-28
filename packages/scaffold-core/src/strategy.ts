import { ScaffoldOptions } from "."
import { loadFromUrl, loadFromFile } from "./load"

export async function loadUsingStrategy(url: string, filePath: string, options: ScaffoldOptions) {
    const fileStrategy = async () => loadFromFile(url, filePath, options)
    const urlStrategy = async () => loadFromUrl(url, filePath, options)

    switch (options.loadStrategy) {
        case "networkOnly":
            return urlStrategy()

        case "networkFirst":
            return urlStrategy().catch(() => fileStrategy())

        case "cacheOnly":
            return fileStrategy()

        default:
            return fileStrategy().catch(() => urlStrategy())
    }
}
