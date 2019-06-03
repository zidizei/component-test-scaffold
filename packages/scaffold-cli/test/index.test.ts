import baseGlob from "glob"
import path from "path"
import fs from "fs"

import { IScaffoldData } from "@component-test/scaffold-core"

import { log } from "../src/util"
import { Parsed } from "../src/cli"
import { update } from "../src"

describe("Scaffold CLI", () => {

    const filename = __filename
    const template = "<body><strong>Test</strong></body>"
    const template2 = "<body><strong>Test 2</strong></body>"

    const url = "https://localhost:8080/patterns/component"

    const scaffoldLocation = path.resolve(
        __dirname,
        "./__scaffolds__/index.test.scaffold.js"
    )

    jest.mock("./__scaffolds__/index.test.scaffold.js", () => ({}))

    const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")
    const mockedGlob = baseGlob as unknown as jest.Mock // Let TypeScript know that 'glob' has been mocked.

    let spyWriteFile: jest.SpyInstance
    let spyLogVerbose: jest.SpyInstance
    let spyLogInfo: jest.SpyInstance
    let spyLogError: jest.SpyInstance

    let _stdOut = ""
    let _stdError = ""

    beforeEach(() => {
        mockedGlob.mockRestore()
        fetchMock.resetMocks()
        spyWriteFile = jest.spyOn(fs, "writeFile")
        spyLogVerbose = jest.spyOn(log, "verbose")
        spyLogInfo = jest.spyOn(log, "info")
        spyLogError = jest.spyOn(log, "error")
        _stdOut = ""
        _stdError = ""
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("can update multiple Scaffold files", async () => {
        fetchMock.mockResponse(template)

        spyLogVerbose.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyLogInfo.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyWriteFile.mockImplementation((_filePath, _data, callback) => {
            callback(null)
        })

        mockedGlob.mockImplementationOnce((_path, callback) => {
            callback(null, [scaffoldLocation, scaffoldLocation])
        })

        const casename = "test case"
        const casedata: IScaffoldData = {
            url,
            test: path.relative(path.dirname(scaffoldLocation), filename),
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await update([], { verbose: true } as Parsed)
        expect(actual.files).toBe(2)
        expect(spyLogVerbose).toBeCalledTimes(2)
        expect(spyLogInfo).toBeCalledTimes(1)
        expect(_stdOut).toMatchSnapshot()
    })

    it("can update single Scaffold file", async () => {
        fetchMock.mockResponse(template2)

        spyLogVerbose.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyLogInfo.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyWriteFile.mockImplementation((_filePath, _data, callback) => {
            callback(null)
        })

        mockedGlob.mockImplementationOnce((_path, callback) => {
            callback(null, [scaffoldLocation])
        })

        const casename = "test case"
        const casedata: IScaffoldData = {
            url,
            test: path.relative(path.dirname(scaffoldLocation), filename),
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await update([], { verbose: false } as Parsed)
        expect(actual.hasError).toBeFalsy()
        expect(actual.files).toBe(1)
        expect(spyLogInfo).toBeCalledTimes(1)
        expect(_stdOut).toMatchSnapshot()
    })

    it("can update pattern-matched Scaffold file", async () => {
        fetchMock.mockResponse(template2)

        spyLogVerbose.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyLogInfo.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyWriteFile.mockImplementation((_filePath, _data, callback) => {
            callback(null)
        })

        mockedGlob.mockImplementationOnce((_path, callback) => {
            callback(null, [scaffoldLocation])
        })

        const casename = "test case"
        const casedata: IScaffoldData = {
            url,
            test: path.relative(path.dirname(scaffoldLocation), filename),
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await update(["pattern.test.js"], { verbose: false } as Parsed)
        expect(actual.hasError).toBeFalsy()
        expect(actual.files).toBe(1)
        expect(spyLogInfo).toBeCalledTimes(2)
        expect(_stdOut).toMatchSnapshot()
    })

    it("displays a message when an Error is being thrown", async () => {
        fetchMock.mockResponseOnce(template, { status: 400 })

        spyLogInfo.mockImplementation((msg) => { _stdOut += msg + "\n" })
        spyLogError.mockImplementation((msg) => { _stdError += msg + "\n" })

        mockedGlob.mockImplementationOnce((_path, callback) => {
            callback(null, [scaffoldLocation])
        })

        const actual = await update([], {} as Parsed)
        expect(actual.hasError).toBeTruthy()
        expect(spyLogInfo).toBeCalledTimes(1)
        expect(spyLogError).toBeCalledTimes(1)
        expect(_stdError).toMatchSnapshot()
    })

})
