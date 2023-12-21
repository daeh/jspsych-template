export type Task = 'response' | 'fixation'
export type Response = 'left' | 'right'
export type KeyboardResponse = 'f' | 'j'

interface RecursiveRecord {
  [key: string]: number | string | RecursiveRecord
}

// prettier-ignore
export type RecursiveRecordArray = Record<string, number | string | RecursiveRecord | number[] | string[] | RecursiveRecord[]>

export interface TrialData {
  task: string
  response: string
  correct: boolean
  correct_response: string
  saveToFirestore: boolean
}
