import type { Timestamp } from 'firebase/firestore'

type PrimitiveValue = number | string | boolean | Timestamp
type SaveableArray = (PrimitiveValue | SaveableDataRecord)[]

export interface SaveableDataRecord {
  [key: string]: PrimitiveValue | SaveableArray | SaveableDataRecord
}
export type SaveableData = PrimitiveValue | SaveableArray | SaveableDataRecord
