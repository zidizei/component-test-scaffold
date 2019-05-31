import baseGlob from "glob"
import path from "path"
import fs from "fs"

import { IScaffoldData } from "@component-test/scaffold-core"

import { Parsed } from "../src/cli"
import { update } from "../src"

describe("Scaffold CLI", () => {

    const filename = __filename
    const template = "<body><strong>Test</strong></body>"

    const url = "https://localhost:8080/patterns/component"

    const scaffoldLocation = path.resolve(
        __dirname,
        "./__scaffolds__/index.test.scaffold.js"
    )

    jest.mock("./__scaffolds__/index.test.scaffold.js", () => ({}))

    const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")
    const mockedGlob = baseGlob as unknown as jest.Mock // Let TypeScript know that 'glob' has been mocked.

    let spyWriteFile: jest.SpyInstance

    beforeEach(() => {
        mockedGlob.mockRestore()
        fetchMock.resetMocks()
        spyWriteFile = jest.spyOn(fs, "writeFile")
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("can update Scaffold files", async () => {
        fetchMock.mockResponseOnce(template)

        spyWriteFile.mockImplementation((_filePath, _data, callback) => {
            callback(null)
        })

        mockedGlob.mockImplementation((_path, callback) => {
            callback(null, [scaffoldLocation])
        })

        const casename = "test case"
        const casedata: IScaffoldData = {
            url,
            casename,
            filename,
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await update([], { verbose: true } as Parsed)
        expect(actual.files).toBe(1)
    })

})
