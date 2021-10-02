const tsPreset = require('ts-jest/jest-preset')
const puppeteerPreset = require('jest-puppeteer/jest-preset')

module.exports = {
  ...tsPreset,
  ...puppeteerPreset,
  globals: {
    test_url: process.env.SERVER_ADDR || "http://127.0.0.1:8000",
  }, 
}