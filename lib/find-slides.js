module.exports = async (page, baseUrl, initialPath) => {
  await page.goto(`${baseUrl}/${initialPath}`)
  const lastSlideNumber = await findLastSlideNumber(page)
  const slideLinks = [`${baseUrl}/${initialPath}`]
  const initialIndex = /\d+/.test(initialPath) ? parseInt(initialPath) + 1 : 1
  for (let i = initialIndex; i <= lastSlideNumber; i++) {
    slideLinks.push(`${baseUrl}/${i}`)
  }
  return slideLinks
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
const nextSlideExists = async (page, retryCount = 10) => {
  const previousSlideNumber = getCurrentSlideNumber(page)
  const previousAnimationStep = await page.evaluate(() => parseInt(window.localStorage['mdx-step'], 10))
  await page.keyboard.press('ArrowRight')
  const animationStep = await page.evaluate(() => parseInt(window.localStorage['mdx-step'], 10))
  // Check if the step increased, which indicates a slide with animation.
  if (animationStep > previousAnimationStep) {
    // One arrow right is not enouh to test for more slides, do more.
    return nextSlideExists(page)
  }
  const newSlideNumber = getCurrentSlideNumber(page)
  // If we didn't find a next page, better doublecheck so we don't miss any.
  if (newSlideNumber === previousSlideNumber && retryCount > 0) {
    return nextSlideExists(page, retryCount - 1)
  }
  return newSlideNumber > previousSlideNumber
}
