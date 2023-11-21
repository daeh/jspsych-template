import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import { initJsPsych } from 'jspsych'

import type { DataCollection } from '../node_modules/jspsych/dist/modules/data/DataCollection'

/* Alternatively
 * type JsPsychInstance = ReturnType<typeof initJsPsych>
 * type JsPsychGetData = JsPsychInstance['data']['get']
 * export type JsPsychDataCollection = ReturnType<JsPsychGetData>
 */

import { debugging, getUserInfo } from './globalVariables'
import { saveTrialDataComplete, saveTrialDataPartial } from './utils'

import imgStimBlue from './images/blue.png'
import imgStimOrange from './images/orange.png'

const debug = debugging()

export async function runExperiment() {
  if (debug) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    on_data_update: function (trialData: TrialData) {
      if (debug) {
        console.log('jsPsych-update :: trialData ::')
        console.log(trialData)
      }
      // if trialData contains a saveToFirestore property, and the property is true, then save the trialData to Firestore
      if (trialData.saveToFirestore) {
        saveTrialDataPartial(trialData).then(
          () => {
            if (debug) {
              console.log('saveTrialDataPartial: Success') // Success!
            }
          },
          (err) => {
            console.error(err) // Error!
          },
        )
      }
    },
    on_finish: async (data: DataCollection) => {
      await saveTrialDataComplete(data.values())
      if (debug) {
        console.log('jsPsych-finish :: data ::')
        console.log(data)
        jsPsych.data.displayData()
      }
    },
  })

  /* create timeline */
  const timeline = []

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
    stimulus: jsPsych.timelineVariable('stimulus') as string,
    choices: ['f', 'j'] as KeyboardResponse[],
    data: {
      task: 'response' as Task,
      correct_response: jsPsych.timelineVariable('correct_response') as string,
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
  let debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      let trials = jsPsych.data.get().filter({ task: 'response' })
      let correct_trials = trials.filter({ correct: true })
      let accuracy = Math.round((correct_trials.count() / trials.count()) * 100)
      let rt = Math.round(correct_trials.select('rt').mean())

      return `<p>You responded correctly on ${accuracy}% of the trials.</p>
          <p>Your average response time was ${rt}ms.</p>
          <p>Press any key to complete the experiment. Thank you!</p>`
    },
  }
  timeline.push(debrief_block)

  /* start the experiment */
  await jsPsych.run(timeline)
}
