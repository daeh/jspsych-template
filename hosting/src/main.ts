import { runExperiment } from './experiment'
import { getExptInitialized, sandboxStatus, setExptInitialized } from './globals'
import 'jspsych/css/jspsych.css'
import './styles/main.css'

const sandy = sandboxStatus()

export function enableBeginExperiment() {
  if (getExptInitialized()) return
  const startButton = document.getElementById('startButton') as HTMLButtonElement
  startButton.textContent = "Let's Go!"
  startButton.disabled = false
  startButton.addEventListener('click', () => {
    startButton.disabled = true
    startButton.blur()
    runExperiment().then(
      (value) => {
        if (sandy) {
          console.log('runExperiment: Finished: Success :: ', value) // Success!
        }
      },
      (reason) => {
        console.error(reason) // Error!
      },
    )
  })
  setExptInitialized(true)
}
