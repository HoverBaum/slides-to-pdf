/**
 * Slides finder supporting Reveal.
 * Finds slides by interacting with Reveals public api.
 */
module.exports = async (page, baseUrl, initialPath) => {
  await page.goto(`${baseUrl}/${initialPath}`)
  const totalSlides = await page.evaluate(() => window.Reveal.getTotalSlides())
  const slides = [page.url()]
  while (slides.length < totalSlides) {
    await page.evaluate(() => window.Reveal.next())
    const foundUrl = page.url()
    if (slides.indexOf(foundUrl) < 0) {
      slides.push(foundUrl)
    }
  }
  return slides
}
