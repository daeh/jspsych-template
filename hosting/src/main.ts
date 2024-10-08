import { runExperiment } from './experiment'
import { debugging, getExptInitialized, setExptInitialized } from './globalVariables'

import './lib/loading'

import './styles/main.css'

// import { doc } from 'firebase/firestore'

const debug = debugging()

export function enableBeginExperiment() {
  /*
   * Called on onAuthStateChanged() after initExperimentData() finishes
   */

  if (getExptInitialized()) return

  const welcomeDiv = document.getElementById('welcome-splash')
  const startButton = document.getElementById('startButton') as HTMLButtonElement
  const loadingDiv = document.getElementById('loading-splash')

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
