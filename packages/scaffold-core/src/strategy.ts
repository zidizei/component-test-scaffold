import { ScaffoldOptions } from "."
import { loadFromUrl, loadFromFile } from "./load"

export async function loadUsingStrategy(url: string, filePath: string, options: ScaffoldOptions) {
    switch (options.loadStrategy) {
        case "networkFirst":
            return loadFromUrl(url, filePath, options)
                .catch(() => {
                    return loadFromFile(url, filePath, options)
                })
    }

    throw new Error(`Unknown load strategy '${options.loadStrategy}'.`)
}
