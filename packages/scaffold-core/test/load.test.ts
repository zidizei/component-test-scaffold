import fs from "fs"
import path from "path"

import prettier from "prettier"

jest.mock("fs")

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

    const mockedFS = fs as jest.Mocked<typeof fs> // Let TypeScript that 'fs' has been mocked.
    const url = "https://localhost:8080/patterns/component"

    jest.mock("./__scaffolds__/index.test.scaffold.js", () => ({}))

    const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")

    beforeEach(() => {
        fetchMock.resetMocks()
    })

    it("can get HTML for scaffolding from URL", async () => {
        fetchMock.mockResponseOnce(template)

        const actual = await loadFromUrl(url, scaffoldLocation, {
            agent: { rejectUnauthorized: false },
            casename: "/patterns/component",
            fallback: true
        } as ScaffoldOptions)

        expect(actual.currentScaffold.template).toBe(prettierTemplate)
        expect(actual.currentScaffold.url).toBe(url)
    })

    it("can get HTML for scaffolding from failing URL via Cache file", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })

        const casename = "test case"
        const casedata: IScaffoldData = {
            url,
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await loadFromUrl(url, scaffoldLocation, {
            agent: { rejectUnauthorized: false },
            casename,
            fallback: true
        } as ScaffoldOptions)

        expect(actual.currentScaffold.template).toBe(template)
        expect(actual.currentScaffold.url).toBe(url)
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
            fallback: true
        } as ScaffoldOptions)

        expect(actual.currentScaffold.template).toBe(template)
        expect(actual.currentScaffold.url).toBe(url)

        delete mockedScaffoldData[casename]
    })

    it("can get HTML for scaffolding from Cache file for a new case name via URL", async () => {
        const casename = "test case"
        fetchMock.mockResponseOnce(template)

        const actual = await loadFromFile(url, scaffoldLocation, {
            casename,
            fallback: true
        } as ScaffoldOptions)

        expect(actual.currentScaffold.template).toBe(prettierTemplate)
        expect(actual.currentScaffold.url).toBe(url)
    })

    it("can create scaffold Cache file", async () => {
        const casename = "writeback"
        const casedata: IScaffoldData = {
            url,
            template
        }

        mockedFS.existsSync.mockImplementation(() => false)
        mockedFS.writeFile.mockImplementation((_filePath, _data, callback) => {
            callback(null)
        })

        await createOrUpdateFile(
            scaffoldLocation,
            { casename, writeback: true } as ScaffoldOptions,
            casedata
        )

        expect(mockedFS.writeFile).toHaveBeenCalledWith(
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

        mockedFS.existsSync.mockImplementation(() => true)
        mockedFS.writeFile.mockImplementation((_filePath, data, callback) => {
            contents = data
            callback(null)
        })

        await createOrUpdateFile(
            scaffoldLocation,
            { casename: "another case", writeback: true } as ScaffoldOptions,
            casedata
        )

        expect(contents).toMatchSnapshot()
        expect(mockedFS.writeFile).toHaveBeenCalledWith(
            scaffoldLocation,
            expect.any(String),
            expect.any(Function)
        )
    })

    it("throws Error when failing to update Cache file", async () => {
        const msg = "Failed to write cache file..."
        const casename = "/write/back"
        const casedata: IScaffoldData = {
            url,
            template
        }

        mockedScaffoldData[casename] = casedata

        mockedFS.existsSync.mockImplementation(() => true)
        mockedFS.writeFile.mockImplementation((_filePath, _data, callback) => {
            callback(new Error(msg))
        })

        await expect(createOrUpdateFile(
            scaffoldLocation,
            { casename: "another case", writeback: true } as ScaffoldOptions,
            casedata
        )).rejects.toThrow(msg)
    })

})
