import fs from "fs"

jest.mock("fs")

import scaffold, { IScaffoldData } from "../src"

describe("Scaffold Core", () => {

    const template = "<body><strong>Test</strong></body>"

    const mockedFS = fs as jest.Mocked<typeof fs> // Let TypeScript that 'fs' has been mocked.
    const url = "https://localhost:8080/patterns/component"

    jest.mock("./__scaffolds__/index.test.scaffold.js", () => ({}))

    const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")

    beforeEach(() => {
        fetchMock.resetMocks()
    })

    it("can get JSDOM from URL for scaffolding", async () => {
        fetchMock.mockResponseOnce("<body><strong>Test</strong></body>")
        mockedFS.existsSync.mockImplementation(() => false)

        const actual = await scaffold(url)

        expect(actual.dom.window.location.href).toBe(url)
        expect(actual.dom.window.document.body).toMatchSnapshot()
    })

    it("can get JSDOM from Cache file for scaffolding", async () => {
        mockedFS.existsSync.mockImplementation(() => true)

        const casename = "/patterns/component"
        const casedata: IScaffoldData = {
            url,
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await scaffold(url)

        expect(actual.dom.window.location.href).toBe(url)
        expect(actual.dom.window.document.body).toMatchSnapshot()

        delete mockedScaffoldData[casename]
    })

})
