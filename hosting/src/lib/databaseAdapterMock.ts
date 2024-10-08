import { doc, getDataBase, getDoc, getUID, runTransaction, setDoc } from './mockDatabase' // DEVELOPMENT

// import { Firestore } from 'firebase/firestore'

export const MockDatabase = {
  doc,
  getDoc,
  runTransaction,
  setDoc,
  getDataBase,
  getUID,
}
