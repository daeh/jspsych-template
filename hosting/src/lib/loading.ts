function showContent(): void {
  const preloadDiv = document.querySelector('#preload-splash')
  const loadingDiv = document.querySelector('#loading-splash')
  const welcomeDiv = document.querySelector('#welcome-splash')

  if (loadingDiv && loadingDiv instanceof HTMLElement) {
    loadingDiv.hidden = false
  }
  preloadDiv?.remove()
  if (welcomeDiv && welcomeDiv instanceof HTMLElement) {
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
