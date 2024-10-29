import { Timestamp } from 'firebase/firestore'

import { debugging, getDocStr, mockStore, setUserInfo, type UserRecord } from '../globalVariables'

import { getBrowserInfo, getOSInfo, getWindowSize } from './clientNavigatorQuery'
import { FireStore } from './databaseAdapterFirestore'
import { MockDatabase } from './databaseAdapterMock'

import type { SaveableDataRecord } from '../../types/project'

const debug: boolean = debugging()
const mock: boolean = mockStore()

const databaseBackend = mock ? MockDatabase : FireStore

// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const arrayUnion = databaseBackend.arrayUnion as typeof import('firebase/firestore').arrayUnion
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const doc = databaseBackend.doc as typeof import('firebase/firestore').doc
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const getDoc = databaseBackend.getDoc as typeof import('firebase/firestore').getDoc
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const runTransaction = databaseBackend.runTransaction as typeof import('firebase/firestore').runTransaction
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const setDoc = databaseBackend.setDoc as typeof import('firebase/firestore').setDoc
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const updateDoc = databaseBackend.updateDoc as typeof import('firebase/firestore').updateDoc
// eslint-disable-next-line @typescript-eslint/consistent-type-imports
const getDataBase = databaseBackend.getDataBase as typeof import('firebase/firestore').getFirestore
const getUID = databaseBackend.getUID

interface ExperimentDocData extends UserRecord {
  dateInit: Timestamp
  debug: boolean
  trialsPartial: SaveableDataRecord[]
  clientInfo: {
    browser: Record<string, string | number>
    os: Record<string, string | number>
    windowSize: Record<string, string | number>
  }
  priorInits?: SaveableDataRecord | SaveableDataRecord[]
}

async function initData(userInfo: UserRecord): Promise<void> {
  const docData: ExperimentDocData = {
    ...userInfo,
    dateInit: Timestamp.now(),
    debug: debug,
    trialsPartial: [],
    clientInfo: {
      browser: getBrowserInfo(),
      os: getOSInfo(),
      windowSize: getWindowSize(),
    },
  }

  const exptDataDoc = getDocStr('exptData')
  const uid = await getUID()
  const db = getDataBase()
  const docRef = doc(db, exptDataDoc, uid)
  const docSnap = await getDoc(docRef)

  if (docSnap.exists()) {
    const existingData = docSnap.data()
    if (existingData.hasOwnProperty('priorInits')) {
      let { priorInits, ...existingDataReduced } = existingData
      if (priorInits && priorInits instanceof Array && priorInits.length > 0) {
        docData.priorInits = [...priorInits, existingDataReduced]
      } else {
        docData.priorInits = [priorInits, existingDataReduced]
      }
    } else {
      docData.priorInits = [existingData]
    }
  }

  await setDoc(docRef, docData)
  if (debug) {
    console.log('initData: Document written')
  }
}

export async function initExperimentData(uid: string): Promise<void> {
  /* Initialize User */
  const userInfo = setUserInfo(uid)

  if (debug) {
    console.log(`Experiment Version: ${userInfo.version}`)
    console.log(`Git Commit: ${userInfo.gitCommit}`)
  }

  /* Initialize User's Data */
  await initData(userInfo)
}

export async function saveTrialDataPartialAddUnique(trialData: SaveableDataRecord): Promise<boolean> {
  try {
    const docRef = doc(getDataBase(), getDocStr('exptData'), await getUID())

    await updateDoc(docRef, {
      // Warning, this only adds unique elements to the array
      // arrayUnion() adds elements to an array but only elements not already present.
      trialsPartial: arrayUnion(trialData),
    })

    return true
  } catch (err) {
    console.error('saveSlideDataRemotely error:', err)
    return false
  }
}

export async function saveTrialDataPartialFullOverwrite(trialData: SaveableDataRecord): Promise<boolean> {
  try {
    const exptDataDoc = getDocStr('exptData')
    const uid = await getUID()
    const db = getDataBase()

    const docRef = doc(db, exptDataDoc, uid)
    await runTransaction(db, async (transaction): Promise<void> => {
      /* Get the latest data, rather than relying on the store */
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('saveTrialDataPartial: Document does not exist')
      }

      /* Get the latest trial and current trial */
      const userData = docSnap.data()

      const data: Record<string, unknown[]> = {}

      data.trialsPartial = userData.trialsPartial ?? []

      data.trialsPartial.push(trialData)

      /* Update the fields in responseData directly */
      transaction.update(docRef, data)

      if (debug) {
        console.log('Successfully saved data')
      }
    })
    return true
  } catch (err) {
    console.error('Error saving data:: ', err)
    return false
  }
}

export async function saveTrialDataPartial(trialData: SaveableDataRecord): Promise<boolean> {
  try {
    const db = getDataBase()
    const docRef = doc(db, getDocStr('exptData'), await getUID())

    await runTransaction(db, async (transaction) => {
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('Document does not exist')
      }

      const data = docSnap.data()
      const trials = Array.isArray(data.trialsPartial) ? data.trialsPartial : []

      transaction.update(docRef, {
        trialsPartial: [...trials, trialData],
      })
    })

    if (debug) {
      console.log('Successfully saved data')
    }
    return true
  } catch (err) {
    console.error('Error saving data:: ', err)
    return false
  }
}

export async function saveTrialDataComplete(jsPsychDataTrials: unknown[]): Promise<boolean> {
  const exptDataDoc = getDocStr('exptData')
  const uid = await getUID()
  const db = getDataBase()

  const docRef = doc(db, exptDataDoc, uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      /* Get the latest data, rather than relying on the store */
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('saveTrialDataComplete: Document does not exist')
      }

      const data: Record<string, unknown[] | Timestamp | string | number> = {
        dataComplete: Timestamp.now(),
        trials: jsPsychDataTrials,
      }

      /* Update the fields in responseData directly */
      transaction.update(docRef, data)

      if (debug) {
        console.log('Successfully saved data')
      }
    })
  } catch (err) {
    console.error('Error saving data:: ', err)
    return false
  }
  return true
}

export async function saveRootData(responseData: SaveableDataRecord): Promise<boolean> {
  const exptDataDoc = getDocStr('exptData')
  const uid = await getUID()
  const db = getDataBase()

  const docRef = doc(db, exptDataDoc, uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      /* Get the latest data, rather than relying on the store */
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('saveRootData: Document does not exist')
      }

      /* Update the fields in responseData directly */
      transaction.update(docRef, responseData)

      if (debug) {
        console.log('Successfully saved data')
      }
    })
  } catch (err) {
    console.error('Error saving data:: ', err)
    return false
  }
  return true
}
