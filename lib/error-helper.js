/**
 * This modules provides helpful feedback based on errors that occured.
 */
module.exports = (error, { baseUrl, firstSlideNumber }) => {
  // User probably provided a malformed or invalid url.
  if (/ERR_CONNECTION_REFUSED/.test(error)) {
    console.log(`
🚨
We couldn't reach the provided url.
Please ensure it is reachable.
We tried to find your first slide at: ${baseUrl}/${firstSlideNumber}.`
    )
  }
}
