import { enableBeginExperiment } from './main'
import { getUserInfo, sandboxStatus, setUserInfo } from './globals'
import { firebaseConfig } from './firebaseConfig'
import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth'
import {
  addDoc,
  collection,
  doc,
  DocumentData,
  getDoc,
  getDocs,
  getFirestore,
  onSnapshot,
  runTransaction,
  setDoc,
  Timestamp,
} from 'firebase/firestore'

const sandy = sandboxStatus()

// Initialize firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
let uid: string
onAuthStateChanged(auth, (user: User | null) => {
  if (user != null) {
    uid = user?.uid
    if (sandy) {
      console.log('anon uid :: ', user.uid)
    }
    initExperiment(uid).then(
      (value) => {
        enableBeginExperiment()
        if (sandy) {
          console.log('initExperiment: Success :: ', value) // Success!
        }
      },
      (reason) => {
        console.error(reason) // Error!
      },
    )
  }
})
void signInAnonymously(auth)

const initExperiment = async (uid: string): Promise<void> => {
  // Initialize User
  const userInfo = initUser(uid)

  // Initialize User's Data
  await initData(userInfo)
}

const initUser = (uid: string) => {
  const queryString: string = window.location.search
  return setUserInfo(uid, queryString)
}

const initData = async (userInfo): Promise<void> => {
  const docData = {
    dateInit: Timestamp.now(),
    trialsPartial: [],
  }

  // update docData with userInfo
  Object.assign(docData, userInfo)

  await setDoc(doc(db, 'exptData', `${uid}`), docData)
  if (sandy) {
    console.log('initData: Document written')
  }
}

export const saveTrialDataPartial = async (trialData): Promise<boolean> => {
  const docRef = doc(db, 'exptData', uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      // Get the latest data, rather than relying on the store
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw 'saveTrialDataPartial: Document does not exist'
      }

      // Get the latest trial and current trial
      const userData = docSnap.data()

      const data: Record<string, any[]> = {}

      if (userData && 'trialsPartial' in userData) {
        data.trialsPartial = userData.trialsPartial
      } else {
        data.trialsPartial = []
      }

      data.trialsPartial.push(trialData)

      // Update the fields in responseData directly
      transaction.update(docRef, data)

      if (sandy) {
        console.log('Successfully saved data')
      }
    })
  } catch (error) {
    console.error('Error saving data', error)
    return false
  }
  return true
}

// Save trial data for questions handling concurrent writes
export const saveTrialDataComplete = async (jsPsychData): Promise<boolean> => {
  const docRef = doc(db, 'exptData', uid)
  try {
    await runTransaction(db, async (transaction): Promise<void> => {
      // Get the latest data, rather than relying on the store
      const docSnap = await transaction.get(docRef)
      if (!docSnap.exists()) {
        throw 'saveTrialDataComplete :: Document does not exist'
      }

      const data: Record<string, any[] | Timestamp | string | number> = {
        dataComplete: Timestamp.now(),
        trials: jsPsychData.trials,
      }

      transaction.update(docRef, data)

      if (sandy) {
        console.log('Successfully saved data')
      }
    })
  } catch (error) {
    console.error('Error saving data', error)
    return false
  }
  return true
}
