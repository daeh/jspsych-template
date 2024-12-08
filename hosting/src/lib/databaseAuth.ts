import { initializeApp } from 'firebase/app'
import { getAuth, onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

import { firebaseConfig } from '../appConfig'
import { debugging, mockStore } from '../globalVariables'
import { enableBeginExperiment } from '../main'

import { initExperimentData } from './databaseUtils'

import type { FirebaseApp } from 'firebase/app'
import type { Auth, User } from 'firebase/auth'
import type { Firestore } from 'firebase/firestore'

const debug: boolean = debugging()
const mock = mockStore()

/* Initialize firebase */
const app: FirebaseApp = initializeApp(firebaseConfig)
const auth: Auth = getAuth(app)
const db: Firestore = getFirestore(app)

let userId: User['uid']

onAuthStateChanged(auth, (user: User | null) => {
  if (mock) {
    return
  }
  // eslint-disable-next-line eqeqeq
  if (user != undefined) {
    const { uid: id } = user
    userId = id
    if (debug) {
      console.log('anon uid ::', user.uid)
    }
    initExperimentData(userId).then(
      () => {
        enableBeginExperiment()
        if (debug) {
          console.log('onAuthStateChanged() :: initExperimentData(): Success') // Success!
        }
      },
      (error: unknown) => {
        console.error(error) // Error!
      },
    )
  }
})

if (!mock) {
  void signInAnonymously(auth)
}

export function getDataBase(): Firestore {
  return db
}

export async function getUID(): Promise<string> {
  let satisfied = false
  let count = 0
  while (!satisfied) {
    if (!userId || typeof userId !== 'string' || userId === '') {
      if (debug) {
        console.log('waiting for uid')
      }
    } else if (typeof userId === 'string' && userId.length > 0) {
      return userId
    }
    if (count > 100) {
      satisfied = true
      console.error('getUID() failed')
    }
    count++
    /// wait before retry ///
    await new Promise((resolve) => {
      setTimeout(resolve, 100)
    })
  }
  return userId
}
