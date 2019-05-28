import { ScaffoldOptions } from "."
import { loadFromUrl, loadFromFile } from "./load"

export async function loadUsingStrategy(url: string, filePath: string, options: ScaffoldOptions) {
    switch (options.loadStrategy) {
        case "networkFirst":
            return loadFromUrl(url, filePath, options)
                .catch(() => loadFromFile(url, filePath, options))

        case "networkOnly":
            return loadFromUrl(url, filePath, options)

        case "cacheFirst":
            return loadFromFile(url, filePath, options)
                .catch(() => loadFromUrl(url, filePath, options))

        case "cacheOnly":
            return loadFromFile(url, filePath, options)
    }

    throw new Error(`Unknown load strategy '${options.loadStrategy}'.`)
}
