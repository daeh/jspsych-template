import { runExperiment } from './experiment'
import { debugging, getExptInitialized, setExptInitialized } from './globalVariables'

import './styles/main.css'

const debug = debugging()

export function enableBeginExperiment() {
  /*
   * Called on onAuthStateChanged() after initExperimentData() finishes
   */

  if (getExptInitialized()) return

  const startButton = document.getElementById('startButton') as HTMLButtonElement

  startButton.addEventListener('click', () => {
    startButton.disabled = true
    startButton.blur()
    runExperiment().then(
      () => {
        if (debug) {
          console.log('runExperiment: Finished: Success') // Success!
        }
      },
      (err) => {
        console.error(err) // Error!
      },
    )
  })

  startButton.textContent = "Let's Go!"
  startButton.disabled = false
  setExptInitialized(true)
}
