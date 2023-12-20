export type Task = 'response' | 'fixation'
export type Response = 'left' | 'right'
export type KeyboardResponse = 'f' | 'j'

interface RecursiveRecord {
  [key: string]: number | string | RecursiveRecord
}

export type RecursiveRecordArray = Record<string, number | string | RecursiveRecord | RecursiveRecord[]>

export interface TrialData {
  task: string
  response: string
  correct: boolean
  correct_response: string
  saveToFirestore: boolean
}
