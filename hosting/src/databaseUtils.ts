import {
  // addDoc,
  // collection,
  doc,
  // DocumentData,
  getDoc,
  // getDocs,
  // getFirestore,
  // onSnapshot,
  runTransaction,
  setDoc,
  Timestamp,
} from 'firebase/firestore'

import { getBrowserInfo, getOSInfo, getWindowSize } from './clientNavigatorQuery'
import { getDataBase, getUID } from './databaseAuth'
import { debugging, getDocStr, setUserInfo, UserRecord } from './globalVariables'

import type { RecursiveRecordArray, TrialData } from './project'

const debug = debugging()

export async function initExperimentData(uid: string): Promise<void> {
  // Initialize User
  const userInfo = setUserInfo(uid)

  if (debug) {
    console.log(`Experiment Version: ${userInfo.version}`)
    console.log(`Git Commit: ${userInfo.gitCommit}`)
  }

  // Initialize User's Data
  await initData(userInfo)
}

async function initData(userInfo: UserRecord): Promise<void> {
  const docData = {
    ...userInfo,
    dateInit: Timestamp.now(),
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
      if (priorInits instanceof Array) {
        // @ts-expect-error priorInits does not exist on type
        docData['priorInits'] = [...priorInits, existingDataReduced]
      } else {
        // @ts-expect-error priorInits does not exist on type
        docData['priorInits'] = [priorInits, existingDataReduced]
      }
    } else {
      // @ts-expect-error priorInits does not exist on type
      docData['priorInits'] = [existingData]
    }
  }

  await setDoc(doc(db, exptDataDoc, uid), docData)
  if (debug) {
    console.log('initData: Document written')
  }
}

export async function saveTrialDataPartial(trialData: TrialData): Promise<boolean> {
  const exptDataDoc = getDocStr('exptData')
  const uid = await getUID()
  const db = getDataBase()
  const docRef = doc(db, exptDataDoc, uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      // Get the latest data, rather than relying on the store
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('saveTrialDataPartial: Document does not exist')
      }

      // Get the latest trial and current trial
      const userData = docSnap.data()

      const data: Record<string, unknown[]> = {}

      if ('trialsPartial' in userData) {
        data.trialsPartial = userData.trialsPartial
      } else {
        data.trialsPartial = []
      }

      data.trialsPartial.push(trialData)

      // Update the fields in responseData directly
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

export async function saveTrialDataComplete(jsPsychDataTrials: unknown[]): Promise<boolean> {
  const exptDataDoc = getDocStr('exptData')
  const uid = await getUID()
  const db = getDataBase()
  const docRef = doc(db, exptDataDoc, uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      // Get the latest data, rather than relying on the store
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('saveTrialDataComplete: Document does not exist')
      }

      const data: Record<string, unknown[] | Timestamp | string | number> = {
        dataComplete: Timestamp.now(),
        trials: jsPsychDataTrials,
      }

      // Update the fields in responseData directly
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

export async function saveRootData(responseData: RecursiveRecordArray): Promise<boolean> {
  const exptDataDoc = getDocStr('exptData')
  const uid = await getUID()
  const db = getDataBase()
  const docRef = doc(db, exptDataDoc, uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      // Get the latest data, rather than relying on the store
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw new Error('saveRootData: Document does not exist')
      }

      // Update the fields in responseData directly
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
