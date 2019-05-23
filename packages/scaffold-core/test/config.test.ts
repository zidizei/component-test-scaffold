import { ScaffoldOptions } from "../src"
import { configure } from "../src/config"

describe("Scaffold Core", () => {

    const url = "https://localhost:8080/patterns/component"

    describe("Config", () => {
        it("can parse Scaffold options", () => {
            const actual = configure(url, {} as ScaffoldOptions, module)
            expect(actual.filename).toBe(__filename)
            expect(actual.casename).toBe("/patterns/component")
        })

        it("can use custom filename for Cache files", () => {
            const actual = configure(url, { filename: "custom.js" } as ScaffoldOptions, null)
            expect(actual.filename).toBe("custom.js")
            expect(actual.casename).toBe("/patterns/component")
        })

        it("can use whole URL as casename", () => {
            const actual = configure("http://localhost:8080/", {} as ScaffoldOptions, module)
            expect(actual.filename).toBe(__filename)
            expect(actual.casename).toBe("http://localhost:8080/")
        })

        it("throws an Error when it cannot determine a test suite filename", () => {
            expect(
                () => configure("http://localhost:8080/", {} as ScaffoldOptions, null)
            ).toThrowErrorMatchingSnapshot()
        })
    })

})
