/* eslint-disable security/detect-object-injection */
/* eslint @typescript-eslint/require-await: 0 */
/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-explicit-any: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { debugging, mockStore, UserRecord } from '../globalVariables'
import { enableBeginExperiment } from '../main'

import { initExperimentData } from './databaseUtils'

import type { Firestore } from 'firebase/firestore'

const mockDb = {} as Firestore

let mockUid: string = `mock-user-${Math.random().toString(36).slice(2, 11)}`

const debug: boolean = debugging()
const mock: boolean = mockStore()

// eslint-disable-next-line unicorn/prefer-structured-clone
const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj))

const log = (message: string, data?: any): void => {
  if (debug) {
    if (data) {
      console.log(`(MockFirestore) ${message}`, data)
    } else {
      console.log(`(MockFirestore) ${message}`)
    }
  }
}

export const doc = (db: any, collection: string, id: string): any => ({
  path: `${collection}/${id}`,
})

export const getDoc = async (docRef: any): Promise<{ exists: () => boolean; data: () => any }> => {
  return {
    exists: () => docRef.path in mockDb,
    data: () => (mockDb[docRef.path] ? deepClone(mockDb[docRef.path]) : undefined),
  }
}

export const getDocs = async (): Promise<{ id: string; data: () => any }[]> => {
  return Object.entries(mockDb).map(([path, data]) => ({
    id: path.split('/').pop(),
    data: () => deepClone(data),
  }))
}

export const setDoc = async (docRef: any, data: any): Promise<void> => {
  mockDb[docRef.path] = deepClone(data)
  log('setDoc: Document set', { path: docRef.path, data })
}

export const updateDoc = async (docRef: any, updates: Record<string, unknown>): Promise<void> => {
  if (!(docRef.path in mockDb)) {
    throw new Error('Document does not exist')
  }

  const updatedFields: Record<string, unknown> = {}

  for (const [key, value] of Object.entries(updates)) {
    // Handle special FieldValue operations like arrayUnion
    if (value?.__type === 'arrayUnion') {
      const currentArray = mockDb[docRef.path][key] || []
      updatedFields[key] = [...new Set([...currentArray, ...value.values])]
    } else {
      updatedFields[key] = value
    }
  }

  mockDb[docRef.path] = {
    ...mockDb[docRef.path],
    ...updatedFields,
  }

  log('updateDoc: Document updated', { path: docRef.path, updates })
}

export const arrayUnion = (...elements: any[]): { __type: string; values: any[] } => ({
  // eslint-disable-next-line @typescript-eslint/naming-convention
  __type: 'arrayUnion',
  values: elements,
})

export const runTransaction = async (db: any, updateFunction: (transaction: any) => Promise<void>): Promise<void> => {
  const mockTransaction = {
    get: getDoc,
    update: async (docRef: any, updates: Record<string, unknown>) => {
      await updateDoc(docRef, updates)
      log('runTransaction: Success')
    },
  }
  await updateFunction(mockTransaction)
}

export const getUID = async (): Promise<string> => {
  if (!mockUid) {
    mockUid = `mock-user-${Math.random().toString(36).slice(2, 11)}`
  }
  return mockUid
}

export const getDataBase = (): Firestore => mockDb

export const getMockDbState = (): Record<string, any> => deepClone(mockDb)

/*
Initialize mock environment
important: called immediately to begin expt
*/
if (mock) {
  // eslint-disable-next-line unicorn/prefer-top-level-await
  getUID().then(
    (uid) => {
      log('getUID():', uid)
      initExperimentData(uid).then(
        () => {
          enableBeginExperiment()
          if (debug) {
            log('MockDB getUID() :: initExperimentData(): Success') // Success!
          }
        },
        (error: unknown) => {
          console.error(error) // Error!
        },
      )
    },
    (error: unknown) => {
      console.error(error)
    },
  )
}
