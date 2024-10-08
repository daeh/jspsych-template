import { doc, getDoc, runTransaction, setDoc } from 'firebase/firestore'

import { getDataBase, getUID } from './databaseAuth'

export const FireStore = {
  doc,
  getDoc,
  runTransaction,
  setDoc,
  getDataBase,
  getUID,
}
