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

  const welcomeDiv = document.getElementById('welcome-splash')
  const startButton = document.getElementById('startButton') as HTMLButtonElement
  const loadingDiv = document.getElementById('loading-splash')

  /* Mock Database Panel */

  const debugButton = document.getElementById('debug-panel-button')
  const debugPanel = document.getElementById('debug-panel-display')
  const debugPanelPre = document.getElementById('debug-panel-code')

  function updateDebugPanel(): void {
    if (debugPanelPre) {
      debugPanelPre.textContent = JSON.stringify(getMockDbState(), null, 2)
    }
  }

  function toggleDebugPanel(): void {
    debugPanel?.classList.toggle('hidden')
    updateDebugPanel()
  }

  debugButton?.addEventListener('click', () => {
    debugButton.blur()
    toggleDebugPanel()
  })

  /* Mock Database Panel */
  if (debug && mock) {
    if (debugButton) {
      debugButton.hidden = false
      debugButton.classList.remove('jspsych-display-element', 'hidden')
    }
    if (debugPanel) {
      debugPanel.hidden = false
      debugPanel.classList.remove('jspsych-display-element')
    }
  } else {
    debugButton?.remove()
    debugPanel?.remove()
  }

  if (loadingDiv) {
    loadingDiv.style.display = 'none'
    loadingDiv.hidden = false
  }

  if (welcomeDiv) {
    welcomeDiv.style.display = 'flex'
    welcomeDiv.hidden = false
  }

  startButton.addEventListener('click', () => {
    startButton.blur()
    startButton.disabled = true

    if (welcomeDiv) {
      welcomeDiv.style.display = 'none'
    }
    welcomeDiv?.remove()

    runExperiment(updateDebugPanel).then(
      () => {
        if (debug) {
          console.log('runExperiment: Finished: Success') // Success!
        }
      },
      (err: unknown) => {
        console.error(err) // Error!
      },
    )
  })

  startButton.textContent = "Let's Go!"
  startButton.disabled = false
  setExptInitialized(true)
}
