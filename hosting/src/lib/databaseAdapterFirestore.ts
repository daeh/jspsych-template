import { arrayUnion, doc, getDoc, runTransaction, setDoc, updateDoc } from 'firebase/firestore'

import { getDataBase, getUID } from './databaseAuth'

export const FireStore = {
  arrayUnion,
  doc,
  getDoc,
  runTransaction,
  setDoc,
  updateDoc,
  getDataBase,
  getUID,
}
