import { description, version } from '../../package.json'

import {
  debuggingMode as debug,
  simulateMockDatabase as mock,
  prolificCCode,
  prolificCUrlLive,
  prolificCUrlTest,
} from './appConfig'

const gitHash: string = __COMMIT_HASH__ || 'unknown'

const urlSearchParams = new URLSearchParams(globalThis.location.search)
const urlParams = Object.fromEntries(urlSearchParams)

export class UserRecord {
  public readonly firebaseUId: string
  public readonly prolificPId: string
  public readonly prolificStudyId: string
  public readonly prolificSessionId: string

  public readonly urlParams: Record<string, string>

  public readonly version: string
  public readonly gitHash: string
  public readonly description: string

  public constructor(firebaseUId: string) {
    this.firebaseUId = firebaseUId

    this.urlParams = urlParams

    this.version = version
    this.gitHash = gitHash
    this.description = description

    if (urlSearchParams.has('PROLIFIC_PID')) {
      this.prolificPId = urlSearchParams.get('PROLIFIC_PID') ?? 'error'
    } else {
      this.prolificPId = ''
    }
    if (urlSearchParams.has('STUDY_ID')) {
      this.prolificStudyId = urlSearchParams.get('STUDY_ID') ?? 'error'
    } else {
      this.prolificStudyId = ''
    }
    if (urlSearchParams.has('SESSION_ID')) {
      this.prolificSessionId = urlSearchParams.get('SESSION_ID') ?? 'error'
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
  return globalThis.location.hostname === 'localhost'
}

export function sandbox(): boolean {
  /* Returns true if web app is running locally or on a sandboxed server
   */
  // TODO add sandboxed server detection
  return emulator()
}

function definitelyLive(): boolean {
  /* Returns true if web app is running on a live server
   */
  return !sandbox() && !emulator() && Object.hasOwn(getURLParams(), 'PROLIFIC_PID')
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

  const urlParameters = getURLParams()

  if (Object.hasOwn(urlParameters, 'debug')) {
    // load with https://*.web.app/?debug
    try {
      const val = urlParameters.debug.toLowerCase()
      if (val === 'false') {
        return false
      }
    } catch (error) {
      console.error('debugging() :: urlParameters["debug"]', error)
    }
    return true
  }
  if (Object.hasOwn(urlParameters, 'nodebug')) {
    // load with https://*.web.app/?nodebug
    return false
  }
  if (!emulator()) {
    return false
  }
  /// If there are are URL Search Params, and the search param do not explicitly use "debug" or "nodebug", turn debugging off
  if (Object.keys(urlParams).length > 0) {
    return false
  }
  return debug
}

export function mockStore(): boolean {
  if (definitelyLive()) {
    return false
  }
  const urlParameters = getURLParams()
  if (Object.hasOwn(urlParameters, 'mock')) {
    // load with https://*.web.app/?mock
    try {
      const val = urlParameters.mock.toLowerCase()
      if (val === 'false') {
        return false
      }
    } catch (error) {
      console.error('mockStore() :: urlParameters["mock"]', error)
    }
    return true
  }
  if (debugging()) {
    return mock
  }
  return false
}

export function getDocStr(docId: string): string {
  /* This gives a way to keep the PRODUCTION mode data separate from the DEBUGGING mode data.
   * Appends "-dbug" to the FireStore docId if web app is in debugging mode or is sandboxed.
   */
  const redirect = sandbox() || debugging()
  const dbstring = redirect ? '-dbug' : ''
  return `${docId}${dbstring}`
}

export const prolificCC = definitelyLive() ? prolificCCode : 'TESTING'
// prettier-ignore
// eslint-disable-next-line @stylistic/max-len
export const prolificCUrl = definitelyLive() ? `${prolificCUrlLive}?cc=${prolificCCode}` : `${prolificCUrlTest}?prolific&cc=${prolificCC}`
