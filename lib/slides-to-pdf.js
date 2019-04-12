const path = require('path')
const puppeteer = require('puppeteer')
const pdfMerge = require('easy-pdf-merge')
const Listr = require('listr')
const fs = require('fs-extra')

const errorHelper = require('./error-helper')

// TODO: really this should be refactored so that it can be programatically used without all the console output.

const slidesToPdf = async (
  inputBaseUrl,
  {
    initialPath, // number or ''
    outputFileName
  }
) => {
  console.clear()

  // Base URL where slides can be found.
  // Assuming we only need to add numbers to this.
  const baseUrl = inputBaseUrl.replace(/\/$/, '')

  // All PDFs that we save on the way.
  const pdfFiles = []

  // Folder where we temporarily save the seperate slides.
  const tmpFolder = path.resolve('.slides-to-pdf')
  // Empty the tmp folder and create if it doesn't exist.
  await fs.emptyDir(tmpFolder)

  // Open a browser.
  const browser = await puppeteer.launch()
  const page = await browser.newPage()

  const tasks = new Listr([
    {
      title: 'Find slides',
      task: ctx => new Promise(async (resolve, reject) => {
        try {
          await page.goto(`${baseUrl}/${initialPath}`)
          const lastSlideNumber = await findLastSlideNumber(page)
          ctx.slideLinks = [`${baseUrl}/${initialPath}`]
          const initialIndex = /\d+/.test(initialPath) ? parseInt(initialPath) + 1 : 1
          for (let i = initialIndex; i <= lastSlideNumber; i++) {
            ctx.slideLinks.push(`${baseUrl}/${i}`)
          }
          resolve()
        } catch (e) {
          reject(e)
        }
      })
    },
    {
      title: 'Save slides',
      task: (ctx, task) => new Promise(async (resolve) => {
        let currentSlideIndex = 0
        while (currentSlideIndex < ctx.slideLinks.length) {
          // We visit each slide directly to ensure it gets loaded.
          // at first used arrow keys but that lead to pages being saved twice
          // due to saving being faster than rendering.
          task.output = `Saving slide ${currentSlideIndex + 1}/${ctx.slideLinks.length}`
          await page.goto(ctx.slideLinks[currentSlideIndex])
          const filePath = path.join(tmpFolder, `page${currentSlideIndex}.pdf`)
          await savePage(page, filePath)
          pdfFiles.push(filePath)
          currentSlideIndex += 1
        }
        resolve()
      })
    },
    {
      title: 'Join slides',
      task: ctx => new Promise(async (resolve, reject) => {
        await page.goto(baseUrl)
        const pageTitle = await page.title()
        const fileName = outputFileName ? outputFileName.replace(/\.pdf$/, '') : pageTitle

        // Save the name that we will write the pdf to in context so we can tell user about it.
        ctx.outputFilePath = path.resolve(process.cwd(), `${fileName}.pdf`)
        pdfMerge(pdfFiles, ctx.outputFilePath, err => {
          if (err) {
            return reject(err)
          }
          resolve()
        })
      })
    },
    {
      title: 'Clean up',
      task: () => new Promise(async (resolve, reject) => {
        try {
          await browser.close()
          await fs.remove(tmpFolder)
        } catch (e) {
          reject(e)
        }
        resolve()
      })
    }
  ])

  tasks.run()
    .then(ctx => console.log(`
Finished 🏁
Saved PDF to: ${ctx.outputFilePath}`))
    .catch(e => {
      console.error(e)

      errorHelper(e, {
        baseUrl,
        firstSlideNumber: initialPath
      })

      process.exit()
    })
}

// Find the last slide number for a page given.
// The page should already be navigated to a slide to start from.
const findLastSlideNumber = async (page) => {
  while (await nextSlideExists(page)) {}
  const lastSlideNumber = getCurrentSlideNumber(page)
  return lastSlideNumber
}

// Find the current slide number, assuming it is the last part of the url.
const getCurrentSlideNumber = (page) => {
  const urlParts = page.url().split('/')
  const number = urlParts[urlParts.length - 1]

  // Only convert digits to number. Otherwise assume 0 (for e.g. "/").
  if (/\d+/.test(number)) return parseInt(number)
  return 0
}

// Checks if the next slide exists by trying to reach it using the right arrow key.
const nextSlideExists = async (page) => {
  const previousSlideNumber = getCurrentSlideNumber(page)
  await page.keyboard.press('ArrowRight')
  const newSlideNumber = getCurrentSlideNumber(page)
  return newSlideNumber > previousSlideNumber
}

// Saves a page as pdf to a location.
const savePage = async (page, filePath) => {
  await page.pdf({
    path: filePath,
    width: 1920,
    height: 1080,
    printBackground: true
  })
}

module.exports = slidesToPdf
