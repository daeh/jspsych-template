export type Task = 'response' | 'fixation'
export type Response = 'left' | 'right'
export type KeyboardResponse = 'f' | 'j'

export interface TrialData {
  task: string
  response: string
  correct: boolean
  correct_response: string
  saveToFirestore: boolean
}
