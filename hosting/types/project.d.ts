import type { Timestamp } from 'firebase/firestore'

type saveableDataBase = string | number | boolean | Timestamp
type saveableDataAllowArrayNesting = saveableDataBase | saveableDataBase[] | saveableDataAllowArrayNesting[]

interface saveableDataRecordBase {
  [key: string]: saveableDataAllowArrayNesting | saveableDataRecordBase | saveableDataRecordBase[]
}
type saveableDataAllowArrayNestingExtended =
  | saveableDataAllowArrayNesting
  | saveableDataRecordBase
  | saveableDataAllowArrayNestingExtended[]

export interface saveableDataRecord {
  [key: string]: saveableDataAllowArrayNestingExtended | saveableDataRecord | saveableDataRecord[]
}

export type saveableData = saveableDataAllowArrayNestingExtended | saveableDataRecord | saveableDataRecord[]
