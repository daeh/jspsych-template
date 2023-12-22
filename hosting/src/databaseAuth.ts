import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously, User } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import { firebaseConfig } from './databaseCred'
import { initExperimentData } from './databaseUtils'
import { debugging } from './globalVariables'
import { enableBeginExperiment } from './main'

const debug = debugging()

// Initialize firebase
const app = initializeApp(firebaseConfig)
const auth = getAuth(app)
const db = getFirestore(app)
let uid: User['uid']

onAuthStateChanged(auth, (user: User | null) => {
  if (user != null) {
    uid = user.uid
    if (debug) {
      console.log('anon uid :: ', user.uid)
    }
    initExperimentData(uid).then(
      () => {
        enableBeginExperiment()
        if (debug) {
          console.log('onAuthStateChanged(): initExperimentData(): Success') // Success!
        }
      },
      (err) => {
        console.error(err) // Error!
      },
    )
  }
})
void signInAnonymously(auth)

export function getDataBase() {
  return db
}

export async function getUID() {
  let satisfied = false
  let count = 0
  while (!satisfied) {
    if (!uid || typeof uid !== 'string' || uid === '') {
      if (debug) {
        console.log('waiting for uid')
      }
    } else if (typeof uid === 'string' && uid.length > 0) {
      return uid
    }
    if (count > 100) {
      satisfied = true
      console.error('getUID() failed')
    }
    count++
    await new Promise((resolve) => setTimeout(resolve, 100))
  }
  return uid
}
