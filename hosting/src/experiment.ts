import { saveTrialDataComplete, saveTrialDataPartial } from './utils'
import { getUserInfo, sandboxStatus } from './globals'
import { initJsPsych } from 'jspsych'
import jsPsychHtmlKeyboardResponse from '@jspsych/plugin-html-keyboard-response'
import jsPsychPreload from '@jspsych/plugin-preload'
import jsPsychImageKeyboardResponse from '@jspsych/plugin-image-keyboard-response'

import blueImg from './images/blue.png'
import orangeImg from './images/orange.png'

const sandy = sandboxStatus()

export async function runExperiment() {
  if (sandy) {
    console.log('--runExperiment--')
    console.log('UserInfo ::', getUserInfo())
  }

  /* initialize jsPsych */
  const jsPsych = initJsPsych({
    on_data_update: function (trialData) {
      if (sandy) {
        console.log('jsPsych-update :: trialData ::')
        console.log(trialData)
      }
      // if trialData contains a saveToFirestore property, and the property is true, then save the trialData to Firestore
      if (trialData?.saveToFirestore) {
        saveTrialDataPartial(trialData).then(
          (value) => {
            if (sandy) {
              console.log('saveTrialDataPartial: Success', value) // Success!
            }
          },
          (reason) => {
            console.error(reason) // Error!
          },
        )
      }
    },
    on_finish: async (data) => {
      await saveTrialDataComplete(data)
      if (sandy) {
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
    images: [blueImg, orangeImg],
  }
  timeline.push(preload)

  /* define welcome message trial */
  const welcome = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: 'Welcome to the experiment. Press any key to begin.',
  }
  timeline.push(welcome)

  /* define instructions trial */
  const instructions = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: `
        <p>In this experiment, a circle will appear in the center 
        of the screen.</p><p>If the circle is <strong>blue</strong>, 
        press the letter F on the keyboard as fast as you can.</p>
        <p>If the circle is <strong>orange</strong>, press the letter J 
        as fast as you can.</p>
        <div style='width: 700px;'>
        <div style='float: left;'><img src='${blueImg}'></img>
        <p class='small'><strong>Press the F key</strong></p></div>
        <div style='float: right;'><img src='${orangeImg}'></img>
        <p class='small'><strong>Press the J key</strong></p></div>
        </div>
        <p>Press any key to begin.</p>
      `,
    post_trial_gap: 2000,
  }
  timeline.push(instructions)

  /* define trial stimuli array for timeline variables */
  const test_stimuli = [
    { stimulus: blueImg, correct_response: 'f' },
    { stimulus: orangeImg, correct_response: 'j' },
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
      task: 'fixation',
    },
  }

  const test = {
    type: jsPsychImageKeyboardResponse,
    stimulus: jsPsych.timelineVariable('stimulus'),
    choices: ['f', 'j'],
    data: {
      task: 'response',
      correct_response: jsPsych.timelineVariable('correct_response'),
    },
    on_finish: function (data) {
      data.correct = jsPsych.pluginAPI.compareKeys(data.response, data.correct_response)
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
  var debrief_block = {
    type: jsPsychHtmlKeyboardResponse,
    stimulus: function () {
      var trials = jsPsych.data.get().filter({ task: 'response' })
      var correct_trials = trials.filter({ correct: true })
      var accuracy = Math.round((correct_trials.count() / trials.count()) * 100)
      var rt = Math.round(correct_trials.select('rt').mean())

      return `<p>You responded correctly on ${accuracy}% of the trials.</p>
          <p>Your average response time was ${rt}ms.</p>
          <p>Press any key to complete the experiment. Thank you!</p>`
    },
  }
  timeline.push(debrief_block)

  /* start the experiment */
  await jsPsych.run(timeline)
}
