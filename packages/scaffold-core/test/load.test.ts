import fs from "fs"
import path from "path"

import prettier from "prettier"

import { IScaffoldData, ScaffoldOptions } from "../src"
import {
    loadFromUrl,
    loadFromFile,
    createOrUpdateFile
} from "../src/load"

describe("Scaffold Core", () => {

    const template = "<body><strong>Test</strong></body>"
    const prettierTemplate = prettier.format(template, { parser: "html" })
    const scaffoldLocation = path.resolve(
        __dirname,
        "__scaffolds__/index.test.scaffold.js"
    )

    const url = "https://localhost:8080/patterns/component"

    let spyExistsSync: jest.SpyInstance
    let spyWriteFile: jest.SpyInstance

    jest.mock("./__scaffolds__/index.test.scaffold.js", () => ({}))

    const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")

    beforeEach(() => {
        fetchMock.resetMocks()
        spyExistsSync = jest.spyOn(fs, "existsSync")
        spyWriteFile = jest.spyOn(fs, "writeFile")
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("can get HTML for scaffolding from URL", async () => {
        fetchMock.mockResponseOnce(template)

        const actual = await loadFromUrl(url, scaffoldLocation, {
            agent: { rejectUnauthorized: false },
            casename: "/patterns/component",
        } as ScaffoldOptions)

        expect(actual.currentScaffold.template).toBe(prettierTemplate)
        expect(actual.currentScaffold.url).toBe(url)
    })

    it("throws an Error when failing to load from URL", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })

        await expect(
            loadFromUrl(
                url, scaffoldLocation, {
                    agent: { rejectUnauthorized: false },
                } as ScaffoldOptions
            )
        ).rejects.toThrowErrorMatchingSnapshot()
    })

    it("can get HTML for scaffolding from Cache file", async () => {
        const casename = "test case"
        const casedata: IScaffoldData = {
            url,
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await loadFromFile(url, scaffoldLocation, {
            casename,
        } as ScaffoldOptions)

        expect(actual.currentScaffold.template).toBe(template)
        expect(actual.currentScaffold.url).toBe(url)

        delete mockedScaffoldData[casename]
    })

    it("throws an Error when failing to load from Cache file", async () => {
        await expect(
            loadFromFile(
                url, scaffoldLocation, {
                    agent: { rejectUnauthorized: false },
                } as ScaffoldOptions
            )
        ).rejects.toThrowErrorMatchingSnapshot()
    })

    it("can create scaffold Cache file", async () => {
        const casename = "writeback"
        const casedata: IScaffoldData = {
            url,
            template
        }

        spyExistsSync.mockImplementation(() => false)
        spyWriteFile.mockImplementation((_filePath, _data, callback) => {
            callback(null)
        })

        await createOrUpdateFile(
            scaffoldLocation,
            { casename, writeback: true } as ScaffoldOptions,
            casedata
        )

        expect(spyWriteFile).toHaveBeenCalledWith(
            scaffoldLocation,
            expect.any(String),
            expect.any(Function)
        )
    })

    it("can update scaffold Cache file", async () => {
        const casename = "/write/back"
        const casedata: IScaffoldData = {
            url,
            template
        }

        let contents: any

        mockedScaffoldData[casename] = casedata

        spyExistsSync.mockImplementation(() => true)
        spyWriteFile.mockImplementation((_filePath, data, callback) => {
            contents = data
            callback(null)
        })

        await createOrUpdateFile(
            scaffoldLocation,
            { casename: "another case", writeback: true } as ScaffoldOptions,
            casedata
        )

        expect(spyWriteFile).toHaveBeenCalledWith(
            scaffoldLocation,
            expect.any(String),
            expect.any(Function)
        )

        spyExistsSync.mockRestore()
        spyWriteFile.mockRestore()

        expect(contents).toMatchSnapshot()
    })

    it("throws Error when failing to update Cache file", async () => {
        const msg = "Failed to write cache file..."
        const casename = "/write/back"
        const casedata: IScaffoldData = {
            url,
            template
        }

        mockedScaffoldData[casename] = casedata

        spyExistsSync.mockImplementation(() => true)
        spyWriteFile.mockImplementation((_filePath, _data, callback) => {
            callback(new Error(msg))
        })

        await expect(createOrUpdateFile(
            scaffoldLocation,
            { casename: "another case", writeback: true } as ScaffoldOptions,
            casedata
        )).rejects.toThrow(msg)
    })

})
