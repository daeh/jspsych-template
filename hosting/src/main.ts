import { runExperiment } from './experiment'
import { debugging, getExptInitialized, setExptInitialized } from './globalVariables'

import './styles/main.css'

const debug = debugging()

export function enableBeginExperiment() {
  /*
   * Called on onAuthStateChanged() after initExperimentData() finishes
   */

  if (getExptInitialized()) return

  const loadingDiv = document.getElementById('loading-splash')
  const welcomeDiv = document.getElementById('welcome-splash')
  const startButton = document.getElementById('startButton') as HTMLButtonElement

  if (loadingDiv !== null) {
    loadingDiv.style.display = 'none'
  }

  if (welcomeDiv) {
    welcomeDiv.style.display = 'flex'
  }

  startButton.addEventListener('click', () => {
    startButton.blur()
    startButton.disabled = true

    if (welcomeDiv) {
      welcomeDiv.style.display = 'none'
    }
    runExperiment().then(
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
