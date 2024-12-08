import { runExperiment } from './experiment'
import { debugging, getExptInitialized, mockStore, setExptInitialized } from './globalVariables'
import { getMockDbState } from './lib/mockDatabase' // Mock Database Panel

import './lib/loading'

import './styles/main.css'

const debug = debugging()
const mock = mockStore()

export function enableBeginExperiment(): void {
  /*
   * Called on onAuthStateChanged() after initExperimentData() finishes
   */

  if (getExptInitialized()) return

  const welcomeDiv = document.querySelector('#welcome-splash')
  const startButton = document.querySelector('#startButton')
  const loadingDiv = document.querySelector('#loading-splash')

  /* Mock Database Panel */

  const debugButton = document.querySelector('#debug-panel-button')
  const debugPanel = document.querySelector('#debug-panel-display')
  const debugPanelPre = document.querySelector('#debug-panel-code')

  function updateDebugPanel(): void {
    if (debugPanelPre) {
      debugPanelPre.textContent = JSON.stringify(getMockDbState(), undefined, 2)
    }
  }

  function toggleDebugPanel(): void {
    debugPanel?.classList.toggle('hidden')
    updateDebugPanel()
  }

  if (debugButton instanceof HTMLElement) {
    debugButton.addEventListener('click', () => {
      debugButton.blur()
      toggleDebugPanel()
    })
  }

  /* Mock Database Panel */
  if (debug && mock) {
    if (debugButton instanceof HTMLElement) {
      debugButton.hidden = false
      debugButton.classList.remove('jspsych-display-element', 'hidden')
    }
    if (debugPanel instanceof HTMLElement) {
      debugPanel.hidden = false
      debugPanel.classList.remove('jspsych-display-element')
    }
  } else {
    debugButton?.remove()
    debugPanel?.remove()
  }

  if (loadingDiv instanceof HTMLElement) {
    loadingDiv.style.display = 'none'
    loadingDiv.hidden = false
  }

  if (welcomeDiv instanceof HTMLElement) {
    welcomeDiv.style.display = 'flex'
    welcomeDiv.hidden = false
  }

  if (startButton instanceof HTMLButtonElement) {
    startButton.addEventListener('click', () => {
      startButton.blur()
      startButton.disabled = true

      if (welcomeDiv instanceof HTMLElement) {
        welcomeDiv.style.display = 'none'
      }
      welcomeDiv?.remove()

      runExperiment(updateDebugPanel).then(
        () => {
          if (debug) {
            console.log('runExperiment: Finished: Success') // Success!
          }
        },
        (error: unknown) => {
          console.error(error) // Error!
        },
      )
    })

    startButton.textContent = "Let's Go!"
    startButton.disabled = false
    setExptInitialized(true)
  }
}
