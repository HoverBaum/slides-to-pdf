#!/usr/bin/env node

const program = require('commander')
const slidesToPdf = require('../lib/slides-to-pdf')
const packageInfo = require('../package.json')

program
  .version(packageInfo.version)
  .usage('[options] <baseUrl>')
  .option('-s, --start-index <index>', 'Start index for slides, otherwise stars at \'/\' and next counts to 1.')
  .option('-o, --output <filename>', 'Filename for output PDF defaults to using page title.')
  .parse(process.argv)

// Ensure baseUrl was provided
const baseUrl = program.args[0]
if (!baseUrl) {
  console.warn('BaseUrl is required. See "--help"')
  process.exit()
}

// Construct options
const startIndex = program.startIndex || ''
const outputFileName = program.output

const options = {
  firstSlideNumber: startIndex
}
if (outputFileName) options.outputFileName = outputFileName

slidesToPdf(baseUrl, options)
