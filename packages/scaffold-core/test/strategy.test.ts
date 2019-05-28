// import fs from "fs"
import path from "path"

import * as load from "../src/load"

import { ScaffoldOptions } from "../src"
import { loadUsingStrategy } from "../src/strategy"

describe("Scaffold Core", () => {

    const template = "<body><strong>Test</strong></body>"
    const scaffoldLocation = path.resolve(
        __dirname,
        "__scaffolds__/index.test.scaffold.js"
    )

    const url = "https://localhost:8080/patterns/component"

    let spyLoadFromFile: jest.SpyInstance
    let spyLoadFromUrl: jest.SpyInstance

    beforeEach(() => {
        fetchMock.resetMocks()
        spyLoadFromFile = jest.spyOn(load, "loadFromFile")
        spyLoadFromUrl = jest.spyOn(load, "loadFromUrl")
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("can get HTML for scaffolding from 'networkFirst'", async () => {
        fetchMock.mockResponseOnce(template)

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkFirst" } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(0)
    })

    it("can get HTML for scaffolding from 'networkFirst' with Cache file backup", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })
        spyLoadFromFile.mockImplementationOnce(() => Promise.resolve())

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkFirst" } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)
    })

    it("can get HTML for scaffolding from 'networkOnly'", async () => {
        fetchMock.mockResponseOnce(template)

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkOnly" } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(0)
    })

    it("throws an Error when 'networkOnly' strategy fails", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })

        await expect(
            loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkOnly" } as ScaffoldOptions)
        ).rejects.toThrowErrorMatchingSnapshot()

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(0)
    })

    it("throws an Error when an unrecognized strategy is used", async () => {
        await expect(loadUsingStrategy(
            url,
            scaffoldLocation,
            { loadStrategy: "unknown" } as any,
        )).rejects.toThrowErrorMatchingSnapshot()
    })

})
