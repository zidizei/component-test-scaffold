import fetch, { GlobalWithFetchMock } from "jest-fetch-mock"

jest.setMock('node-fetch', fetch)

const customGlobal: GlobalWithFetchMock = global as GlobalWithFetchMock
customGlobal.fetch = require('jest-fetch-mock')
customGlobal.fetchMock = customGlobal.fetch
