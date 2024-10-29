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

let mockUid: string | null = 'mock-user-' + Math.random().toString(36).substring(2, 11)

const debug: boolean = debugging()
const mock: boolean = mockStore()

const deepClone = (obj: any): any => JSON.parse(JSON.stringify(obj))
const log = (message: string, data?: any) => {
  if (debug) {
    console.log(`Mock Firestore: ${message}`, data)
  }
}

export const doc = (db: any, collection: string, id: string): any => ({
  path: `${collection}/${id}`,
})

export const getDoc = async (docRef: any) => ({
  exists: () => docRef.path in mockDb,
  data: () => (mockDb[docRef.path] ? deepClone(mockDb[docRef.path]) : null),
})

export const setDoc = async (docRef: any, data: any): Promise<void> => {
  mockDb[docRef.path] = deepClone(data)
  log('Document set', { path: docRef.path, data })
}

// New function to match Firestore
export const updateDoc = async (docRef: any, updates: any): Promise<void> => {
  if (!(docRef.path in mockDb)) {
    throw new Error('Document does not exist')
  }

  mockDb[docRef.path] = {
    ...mockDb[docRef.path],
    ...Object.entries(updates).reduce<Record<string, any>>((acc, [key, value]) => {
      // Handle special FieldValue operations like arrayUnion
      if (value?.__type === 'arrayUnion') {
        const currentArray = mockDb[docRef.path][key] || []
        acc[key] = [...new Set([...currentArray, ...value.values])]
      } else {
        acc[key] = value
      }
      return acc
    }, {}),
  }

  log('Document updated', { path: docRef.path, updates })
}

// New function to match Firestore
export const arrayUnion = (...elements: any[]) => ({
  __type: 'arrayUnion',
  values: elements,
})

export const runTransaction = async (db: any, updateFunction: (transaction: any) => Promise<void>): Promise<void> => {
  const mockTransaction = {
    get: getDoc,
    update: async (docRef: any, updates: any) => {
      await updateDoc(docRef, updates)
      log('Mock Firestore: Document updated', { path: docRef.path, data })
    },
  }
  await updateFunction(mockTransaction)
}

export const getUID = async (): Promise<string> => {
  if (!mockUid) {
    mockUid = 'mock-user-' + Math.random().toString(36).substring(2, 11)
  }
  return mockUid
}

export const getDataBase = (): Firestore => mockDb

export const getMockDbState = (): Record<string, any> => deepClone(mockDb)

/* important: called immediately to begin expt */
if (mock) {
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
        (err: unknown) => {
          console.error(err) // Error!
        },
      )
    },
    (err: unknown) => {
      console.error(err)
    },
  )
}
