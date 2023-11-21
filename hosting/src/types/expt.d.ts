declare type Task = 'response' | 'fixation'
declare type Response = 'left' | 'right'
declare type KeyboardResponse = 'f' | 'j'

interface TrialData {
  task: string
  response: string
  correct: boolean
  correct_response: string
  saveToFirestore: boolean
}
