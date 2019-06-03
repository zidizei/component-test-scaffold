import baseGlob from "glob"
import console from "console"

import { LoadFromUrlError } from "@component-test/scaffold-core/dist/error"

import { glob, log } from "../src/util"

describe("Scaffold CLI", () => {

    describe("Utils", () => {

        const mockedGlob = baseGlob as unknown as jest.Mock // Let TypeScript know that 'glob' has been mocked.

        beforeEach(() => {
            mockedGlob.mockRestore()
        })

        it("can glob scaffold files", async () => {
            mockedGlob.mockImplementation((_path, callback) => {
                callback(null, ["hello", "world"])
            })

            const actual = await glob([])
            expect(actual).toEqual(["hello", "world"])
            expect(mockedGlob).toHaveBeenCalledWith(
                expect.stringMatching(/__scaffolds__\/\*\.scaffold\.js$/),
                expect.any(Function)
            )
        })

        it("can glob scaffold files with patterns", async () => {
            mockedGlob.mockImplementation((_path, callback) => {
                callback(null, [])
            })

            await glob(["main.test", "other.spec"])
            expect(mockedGlob).toHaveBeenCalledWith(
                expect.stringMatching(/__scaffolds__\/\+\(main\.test\|other\.spec\)\.\*\.scaffold\.js$/),
                expect.any(Function)
            )
        })

        it("rejects with an error when failing to glob files", async () => {
            mockedGlob.mockImplementation((_path, callback) => {
                callback(new Error("Failed"), [])
            })

            await expect(glob([])).rejects.toThrow()
        })

    })

    describe("Logs", () => {

        let _stdout = ""
        let _stderror = ""
        let spyConsoleLog: jest.SpyInstance
        let spyConsoleError: jest.SpyInstance

        beforeEach(() => {
            _stdout = ""
            spyConsoleLog = jest.spyOn(console, "log")
            spyConsoleError = jest.spyOn(console, "error")
            spyConsoleLog.mockImplementation((msg) => {
                _stdout += msg
            })
            spyConsoleError.mockImplementation((msg) => {
                _stderror += msg
            })
        })

        afterEach(() => {
            jest.restoreAllMocks()
        })

        it("can log verbose messages", () => {
            log.verbose("test message")
            expect(spyConsoleLog).toHaveBeenCalledTimes(1)
            expect(_stdout).toMatchSnapshot()
        })

        it("can log info messages", () => {
            log.info("test message")
            expect(spyConsoleLog).toHaveBeenCalledTimes(1)
            expect(_stdout).toMatchSnapshot()
        })

        it("can log URL Errors", () => {
            log.error(new LoadFromUrlError("Message"))
            expect(spyConsoleError).toHaveBeenCalledTimes(2)
            expect(_stderror).toMatchSnapshot()
        })

    })

})
