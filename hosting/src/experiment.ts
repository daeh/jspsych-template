import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'
import { getMockDbState } from './lib/mockDatabase' // Mock Database Panel

import type { KeyboardResponse, Task, TrialData } from './project'
import type { DataCollection } from 'jspsych'

import imgStimBlue from './images/blue.png'
import imgStimOrange from './images/orange.png'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

const debug = debugging()
const mock = mockStore()

/* Mock Database Panel */

const debugButton = document.getElementById('debug-panel-button')
const debugPanel = document.getElementById('debug-panel-display')
const debugPanelPre = document.getElementById('debug-panel-code')

function updateDebugPanel() {
  if (debugPanelPre) {
    debugPanelPre.textContent = JSON.stringify(getMockDbState(), null, 2)
  }
}

function toggleDebugPanel() {
  debugPanel?.classList.toggle('hidden')
  updateDebugPanel()
}

debugButton?.addEventListener('click', () => {
  debugButton.blur()
  toggleDebugPanel()
})

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="align-middle text-center"> 
Please wait. You will be redirected back to Prolific in a few moments. 
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = () => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    window.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = () => {
  const contentDiv = document.getElementById('jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment() {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    on_data_update: function (trialData: TrialData) {
      if (debug) {
        console.log('jsPsych-update :: trialData ::', trialData)
      }
      // if trialData contains a saveToFirestore property, and the property is true, then save the trialData to Firestore
      if (trialData.saveToFirestore) {
        saveTrialDataPartial(trialData).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
              if (mock) {
                updateDebugPanel()
              }
            }
          },
          (err: unknown) => {
            console.error(err) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.getElementById('jspsych-content')
      if (contentDiv) contentDiv.innerHTML = '<p> Please wait, your data are being saved.</p>'
      saveTrialDataComplete(data.values()).then(
        () => {
          if (debug) {
            exitExperimentDebugging()
            console.log('saveTrialDataComplete: Success') // Success!
            console.log('jsPsych-finish :: data ::')
            console.log(data)
            setTimeout(() => {
              jsPsych.data.displayData()
            }, 3000)
          } else {
            exitExperiment()
          }
        },
        (err: unknown) => {
          console.error(err) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */
  const timeline: Record<string, any>[] = []

  /* preload images */
  const preload = {
    type: jsPsychPreload,
    images: [imgStimBlue, imgStimOrange],
  }
  timeline.push(preload)

  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<span class="text-xl">Welcome to the experiment. Press any key to begin.</span>',
  }
  timeline.push(welcome)

  /* define instructions trial */
  const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>In this experiment, a circle will appear in the center of the screen.</p>
        <p>If the circle is <span class="text-blue-500 font-semibold">blue</span>, 
        press the letter <span class="text-blue-500 font-semibold">F</span> on the keyboard as fast as you can.</p>
        <p>If the circle is <span class="text-orange-500 font-semibold">orange</span>, 
        press the letter <span class="text-orange-500 font-semibold">J</span> as fast as you can.</p>
        <div style='width: 700px;'>
        <div style='float: left;'><img src='${imgStimBlue}'></img>
        <p class='small'><strong>Press the F key</strong></p></div>
        <div style='float: right;'><img src='${imgStimOrange}'></img>
        <p class='small'><strong>Press the J key</strong></p></div>
        </div>
        <p>Press any key to begin.</p>
      `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions)

  /* define trial stimuli array for timeline variables */
  const test_stimuli: Record<string, string>[] = [
    { stimulus: imgStimBlue, correct_response: 'f' as KeyboardResponse },
    { stimulus: imgStimOrange, correct_response: 'j' as KeyboardResponse },
  ]

  /* define fixation and test trials */
  const fixation = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: '<div style="font-size:60px;">+</div>',
    choices: 'NO_KEYS',
    trial_duration: function () {
      return jsPsych.randomization.sampleWithoutReplacement(
        [250, 500, 750, 1000, 1250, 1500, 1750, 2000],
        1,
      )[0] as number
    },
    data: {
      task: 'fixation' as Task,
    },
  }

  const test = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus') as unknown as string,
    choices: ['f', 'j'] as KeyboardResponse[],
    data: {
      task: 'response' as Task,
      correct_response: jsPsych.timelineVariable('correct_response') as unknown as string,
    },
    on_finish: function (data: TrialData) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response || null, data.correct_response || null)
      data.saveToFirestore = true
    },
  }

  /* define test procedure */
  const test_procedure = {
    timeline: [fixation, test],
    timeline_variables: test_stimuli,
    repetitions: 3,
    randomize_order: true,
  }
  timeline.push(test_procedure)

  /* define debrief */
  const debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      const trials = jsPsych.data.get().filter({ task: 'response' })
      const correct_trials = trials.filter({ correct: true })
      const accuracy = Math.round((correct_trials.count() / trials.count()) * 100)
      const rt = Math.round(correct_trials.select('rt').mean())

      return `<p>You responded correctly on ${accuracy.toString()}% of the trials.</p>
          <p>Your average response time was ${rt.toString()}ms.</p>
          <p>Press any key to complete the experiment. Thank you!</p>`
    },
  }
  timeline.push(debrief_block)

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

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
