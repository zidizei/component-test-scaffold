import fs from "fs"
import scaffold, { IScaffoldData } from "../src"

describe("Scaffold Core", () => {

    const template = "<body><strong>Test</strong></body>"

    const url = "https://localhost:8080/patterns/component"

    let spyExistsSync: jest.SpyInstance
    jest.mock("./__scaffolds__/index.test.scaffold.js", () => ({}))

    const mockedScaffoldData = require("./__scaffolds__/index.test.scaffold.js")

    beforeEach(() => {
        fetchMock.resetMocks()
        spyExistsSync = jest.spyOn(fs, "existsSync")
    })

    afterEach(() => {
        jest.restoreAllMocks()
    })

    it("can get JSDOM from URL for scaffolding", async () => {
        fetchMock.mockResponseOnce("<body><strong>Test</strong></body>")
        spyExistsSync.mockImplementation(() => false)

        const actual = await scaffold(url)
        spyExistsSync.mockRestore()

        expect(actual.dom.window.location.href).toBe(url)
        expect(actual.dom.window.document.body).toMatchSnapshot()
    })

    it("can get JSDOM from Cache file for scaffolding", async () => {
        spyExistsSync.mockImplementation(() => true)

        const filename = __filename
        const casename = "/patterns/component"
        const casedata: IScaffoldData = {
            url,
            test: filename,
            template
        }

        mockedScaffoldData[casename] = casedata

        const actual = await scaffold(url)
        spyExistsSync.mockRestore()

        expect(actual.dom.window.location.href).toBe(url)
        expect(actual.dom.window.document.body).toMatchSnapshot()

        delete mockedScaffoldData[casename]
    })

})
