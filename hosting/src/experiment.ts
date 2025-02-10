/* eslint-disable @typescript-eslint/naming-convention */

import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import { debugging, getUserInfo, mockStore, prolificCC, prolificCUrl } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './lib/databaseUtils'

import type { SaveableDataRecord } from '../types/project'
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

type Task = 'response' | 'fixation'
type Response = 'left' | 'right'
type KeyboardResponse = 'f' | 'j'

interface TrialData {
  task: Task
  response: Response
  correct: boolean
  correct_response: Response
  saveIncrementally: boolean
}

const debuggingText = debug ? `<br /><br />redirect link : ${prolificCUrl}` : '<br />'
const exitMessage = `<p class="text-center align-middle">
Please wait. You will be redirected back to Prolific in a few moments.
<br /><br />
If not, please use the following completion code to ensure compensation for this study: ${prolificCC}
${debuggingText}
</p>`

const exitExperiment = (): void => {
  document.body.innerHTML = exitMessage
  setTimeout(() => {
    globalThis.location.replace(prolificCUrl)
  }, 3000)
}

const exitExperimentDebugging = (): void => {
  const contentDiv = document.querySelector('#jspsych-content')
  if (contentDiv) contentDiv.innerHTML = exitMessage
}

export async function runExperiment(updateDebugPanel: () => void): Promise<void> {
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
      // if trialData contains a saveIncrementally property, and the property is true, then save the trialData to Firestore immediately (otherwise the data will be saved at the end of the experiment)
      if (trialData.saveIncrementally) {
        saveTrialDataPartial(trialData as unknown as SaveableDataRecord).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
              if (mock) {
                updateDebugPanel()
              }
            }
          },
          (error: unknown) => {
            console.error(error) // Error!
          },
        )
      }
    },
    on_finish: (data: DataCollection) => {
      const contentDiv = document.querySelector('#jspsych-content')
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
        (error: unknown) => {
          console.error(error) // Error!
          exitExperiment()
        },
      )
    },
  })

  /* create timeline */
  const timeline: Record<string, unknown>[] = []

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
<p>If the circle is <span class="font-semibold text-blue-500">blue</span>, press the letter <span class="font-semibold text-blue-500">F</span> on the keyboard as fast as you can.</p>
<p>If the circle is <span class="font-semibold text-orange-500">orange</span>, press the letter <span class="font-semibold text-orange-500">J</span> as fast as you can.</p>
<div class="w-[700px]">
  <div class="float-left">
    <img src="${imgStimBlue}" />
    <p class="small"><strong>Press the F key</strong></p>
  </div>
  <div class="float-right">
    <img src="${imgStimOrange}" />
    <p class="small"><strong>Press the J key</strong></p>
  </div>
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
      return jsPsych.randomization.sampleWithoutReplacement([250, 500, 750, 1000, 1250, 1500, 1750, 2000], 1)[0]
    },
    data: {
      task: 'fixation' satisfies Task,
    },
  }

  const test = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus') as unknown as string,
    choices: ['f', 'j'] satisfies KeyboardResponse[],
    data: {
      task: 'response' satisfies Task,
      correct_response: jsPsych.timelineVariable('correct_response') as unknown as string,
    },
    on_finish: function (data: TrialData) {
      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition, unicorn/no-null
      data.correct = jsPsych.pluginAPI.compareKeys(data.response || null, data.correct_response || null)
      data.saveIncrementally = true
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

  /* start the experiment */
  // @ts-expect-error allow timeline to be type jsPsych TimelineArray
  await jsPsych.run(timeline)
}
