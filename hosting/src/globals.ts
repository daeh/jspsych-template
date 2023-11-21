const sandy = true

export class UserData {
  readonly firebaseUId: string
  readonly prolificPId: string
  readonly prolificStudyId: string
  readonly prolificSessionId: string

  urlParams: Record<string, string>

  constructor(firebaseUId: string, queryString: string) {
    this.firebaseUId = firebaseUId

    const urlSearchParams = new URLSearchParams(queryString)
    this.urlParams = Object.fromEntries(urlSearchParams)

    if (urlSearchParams.has('PROLIFIC_PID')) {
      this.prolificPId = urlSearchParams.get('PROLIFIC_PID')
    } else {
      this.prolificPId = ''
    }
    if (urlSearchParams.has('STUDY_ID')) {
      this.prolificStudyId = urlSearchParams.get('STUDY_ID')
    } else {
      this.prolificStudyId = ''
    }
    if (urlSearchParams.has('SESSION_ID')) {
      this.prolificSessionId = urlSearchParams.get('SESSION_ID')
    } else {
      this.prolificSessionId = ''
    }
  }
}

let exptInitialized: boolean = false
let userInfo: UserData

export function sandboxStatus() {
  let sandbox = sandy
  if (userInfo?.prolificPId) {
    sandbox = false
  }
  return sandbox
}

export function getUserInfo(): UserData {
  return userInfo
}

export function setUserInfo(uid: string, queryString: string): UserData {
  userInfo = new UserData(uid, queryString)
  return getUserInfo()
}

export function getExptInitialized(): boolean {
  return exptInitialized
}

export function setExptInitialized(newValue: boolean): void {
  exptInitialized = newValue
}
