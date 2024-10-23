import { description, version } from '../../package.json'

import {
  debuggingMode as debug,
  simulateMockDatabase as mock,
  prolificCCode,
  prolificCUrlLive,
  prolificCUrlTest,
} from './config'

const gitCommit: string = __COMMIT_HASH__ || 'unknown'

const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams)

export class UserRecord {
  readonly firebaseUId: string
  readonly prolificPId: string
  readonly prolificStudyId: string
  readonly prolificSessionId: string

  readonly urlParams: Record<string, string>

  readonly version: string
  readonly gitCommit: string
  readonly description: string

  constructor(firebaseUId: string) {
    this.firebaseUId = firebaseUId

    this.urlParams = urlParams

    this.version = version
    this.gitCommit = gitCommit
    this.description = description

    if (urlSearchParams.has('PROLIFIC_PID')) {
      this.prolificPId = urlSearchParams.get('PROLIFIC_PID') || 'error'
    } else {
      this.prolificPId = ''
    }
    if (urlSearchParams.has('STUDY_ID')) {
      this.prolificStudyId = urlSearchParams.get('STUDY_ID') || 'error'
    } else {
      this.prolificStudyId = ''
    }
    if (urlSearchParams.has('SESSION_ID')) {
      this.prolificSessionId = urlSearchParams.get('SESSION_ID') || 'error'
    } else {
      this.prolificSessionId = ''
    }
  }
}

let exptInitialized: boolean = false
let userInfo: UserRecord

export function getURLParams(): Record<string, string> {
  return urlParams
}

export function setUserInfo(uid: string): UserRecord {
  userInfo = new UserRecord(uid)
  return userInfo
}

export function getUserInfo(): UserRecord {
  return userInfo
}

export function setExptInitialized(newValue: boolean): void {
  exptInitialized = newValue
}

export function getExptInitialized(): boolean {
  return exptInitialized
}

function emulator(): boolean {
  /* Returns true if web app is running locally
   */
  return window.location.hostname === 'localhost'
}

export function sandbox() {
  /* Returns true if web app is running locally or on a sandboxed server
   */
  //TODO add sandboxed server detection
  return emulator()
}

function definitelyLive() {
  /* Returns true if web app is running on a live server
   */
  return !sandbox() && !emulator() && getURLParams().hasOwnProperty('PROLIFIC_PID')
}

export function debugging(): boolean {
  /*
   * If web app is NOT running locally:
   *   if there are any URL Search Params, force PRODUCTION mode
   *   UNLESS "debug" is in URL Search Params, in which case force DEBUGGING mode
   *   Otherwise, respect `debug` variable setting.
   * If web app is running locally:
   *   respect `debug` variable setting
   *   (but URL Search Params can override it).
   */
  if (definitelyLive()) {
    return false
  }
  if (getURLParams().hasOwnProperty('debug')) {
    // load with https://*.web.app/?debug
    return true
  }
  if (getURLParams().hasOwnProperty('nodebug')) {
    // load with https://*.web.app/?nodebug
    return false
  }
  if (!emulator()) {
    return false
  }
  if (Object.keys(getURLParams()).length) {
    return false
  }
  return debug
}

export function mockStore(): boolean {
  if (!debugging()) {
    return false
  }
  return mock
}

export function getDocStr(docId: string) {
  /* This gives a way to keep the PRODUCTION mode data separate from the DEBUGGING mode data.
   * Appends "-dbug" to the FireStore docId if web app is in debugging mode or is sandboxed.
   */
  const redirect = sandbox() || debugging()
  const dbstring = redirect ? '-dbug' : ''
  return `${docId}${dbstring}`
}

export const prolificCC = definitelyLive() ? prolificCCode : 'TESTING'
export const prolificCUrl = definitelyLive()
  ? `${prolificCUrlLive}?cc=${prolificCCode}`
  : `${prolificCUrlTest}?prolific&cc=${prolificCC}`
