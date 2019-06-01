import path from "path"

jest.mock("./__scaffolds__/index.test.scaffold.js")
const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")

import * as load from "../src/load"

import { ScaffoldOptions } from "../src"
import { loadUsingStrategy } from "../src/strategy"

describe("Scaffold Core", () => {

    const filename = __filename
    const template = "<body><strong>Test</strong></body>"
    const scaffoldLocation = path.resolve(
        __dirname,
        "__scaffolds__/index.test.scaffold.js"
    )

    const casename = "test case"
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

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkFirst", filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(0)
    })

    it("can get HTML for scaffolding from 'networkFirst' with Cache file backup", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })
        spyLoadFromFile.mockImplementationOnce(() => Promise.resolve())

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkFirst", filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)
    })

    it("can get HTML for scaffolding from 'networkOnly'", async () => {
        fetchMock.mockResponseOnce(template)

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkOnly", filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(0)
    })

    it("throws an Error when 'networkOnly' strategy fails", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })

        await expect(
            loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "networkOnly", filename } as ScaffoldOptions)
        ).rejects.toThrowErrorMatchingSnapshot()

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(0)
    })

    it("can get HTML for scaffolding from 'cacheFirst'", async () => {
        mockedScaffoldData[casename] = { casename }

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "cacheFirst", casename, filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(0)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)

        delete mockedScaffoldData[casename]
    })

    it("can get HTML for scaffolding from 'cacheFirst' with Cache file backup", async () => {
        fetchMock.mockResponseOnce(template)

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "cacheFirst", filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)
    })

    it("can get HTML for scaffolding from 'cacheOnly'", async () => {
        mockedScaffoldData[casename] = { casename }

        await loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "cacheOnly", casename, filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(0)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)

        delete mockedScaffoldData[casename]
    })

    it("can get HTML for scaffolding from 'cacheOnly' with Cache file backup", async () => {
        await expect(
            loadUsingStrategy(url, scaffoldLocation, { loadStrategy: "cacheOnly", filename } as ScaffoldOptions)
        ).rejects.toThrowErrorMatchingSnapshot()

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(0)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)
    })

    it("uses 'cacheFirst' strategy by default", async () => {
        fetchMock.mockResponseOnce(template)

        await loadUsingStrategy(url, scaffoldLocation, { filename } as ScaffoldOptions)

        expect(spyLoadFromUrl).toHaveBeenCalledTimes(1)
        expect(spyLoadFromFile).toHaveBeenCalledTimes(1)
    })

})
