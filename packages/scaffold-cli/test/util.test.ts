import baseGlob from "glob"

import { glob } from "../src/util"

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

})
