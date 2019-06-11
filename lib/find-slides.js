const mdxFinder = require('./slide-finders/mdx')
const revealFinder = require('./slide-finders/reveal')

module.exports = async (page, baseUrl, initialPath) => {
  await page.goto(`${baseUrl}/${initialPath}`)
  const shouldUseMdx = await page.evaluate(() => window.localStorage['mdx-step'] === '0')
  if (shouldUseMdx) return mdxFinder(page, baseUrl, initialPath)

  const shouldUseReveal = await page.evaluate(() => !!window.Reveal)
  if (shouldUseReveal) return revealFinder(page, baseUrl, initialPath)

  // Use MDX for default
  return mdxFinder(page, baseUrl, initialPath)
}
