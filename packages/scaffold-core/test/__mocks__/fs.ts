const fs = jest.requireActual("fs")

fs.existsSync = jest.fn()
fs.readFile = jest.fn()
fs.writeFile = jest.fn()

module.exports = fs
