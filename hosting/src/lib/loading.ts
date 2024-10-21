function showContent() {
  const preloadDiv = document.getElementById('preload-splash')
  const loadingDiv = document.getElementById('loading-splash')
  const welcomeDiv = document.getElementById('welcome-splash')

  if (loadingDiv) {
    loadingDiv.hidden = false
  }
  preloadDiv?.remove()
  if (welcomeDiv) {
    welcomeDiv.hidden = false
  }
}

document.addEventListener('DOMContentLoaded', () => {
  /* This runs when the initial HTML document has been completely loaded and parsed */
  console.log('DOM fully loaded and parsed')

  /* Wait a short time to ensure Tailwind styles have been applied */
  setTimeout(() => {
    showContent()
    console.log('Styles applied, content revealed')
  }, 100) // Adjust this delay if needed
})

/* Callback to ensure content is displayed even if something goes wrong */
window.addEventListener('load', () => {
  // This runs when the whole page has loaded, including all dependent resources such as stylesheets and images
  showContent()
  console.log('Page fully loaded')
})
