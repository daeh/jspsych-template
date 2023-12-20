const debug = true

const urlSearchParams = new URLSearchParams(window.location.search)
const urlParams = Object.fromEntries(urlSearchParams)

export class UserRecord {
  readonly firebaseUId: string
  readonly prolificPId: string
  readonly prolificStudyId: string
  readonly prolificSessionId: string

  urlParams: Record<string, string>

  constructor(firebaseUId: string) {
    this.firebaseUId = firebaseUId

    this.urlParams = urlParams

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

export function debugging() {
  /*
   * If web app is NOT running locally:
   *   if there are any URL Search Params, force PRODUCTION mode
   *   UNLESS "debug" is in URL Search Params, in which case force DEBUGGING mode
   *   Otherwise, respect `debug` variable setting.
   * If web app is running locally:
   *   respect `debug` variable setting
   *   (but URL Search Params can override it).
   */
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

export function getDocStr(docId: string) {
  /* This gives a way to keep the PRODUCTION mode data separate from the DEBUGGING mode data.
   * Appends "-dbug" to the FireStore docId if web app is in debugging mode or is sandboxed.
   */
  const redirect = sandbox() || debugging()
  const dbstring = redirect ? '-dbug' : ''
  return `${docId}${dbstring}`
}
