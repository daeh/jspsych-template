import { debugging } from '../globalVariables'

const debug = debugging()

interface BrowserInfo extends Record<string, string> {
  name: string
  version: string
}

interface OSInfo extends Record<string, string> {
  name: string
}

interface WindowSize extends Record<string, number> {
  width: number
  height: number
}

export function getBrowserInfo(): BrowserInfo {
  let name = 'Unknown'
  let version = 'Unknown'
  try {
    const userAgent = navigator.userAgent

    if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      version = userAgent.split('Firefox/')[1]
    } else if (userAgent.includes('Chrome')) {
      name = 'Chrome'
      version = userAgent.split('Chrome/')[1].split(' ')[0]
    } else if (userAgent.includes('Safari')) {
      name = 'Safari'
      version = userAgent.split('Version/')[1].split(' ')[0]
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      name = 'Internet Explorer'
      version = userAgent.split('rv:')[1].split(')')[0]
    }
  } catch (err) {
    if (debug) {
      console.error(err)
    }
  }
  return { name, version }
}

export function getOSInfo(): OSInfo {
  let name = 'Unknown'
  try {
    const userAgent = navigator.userAgent
    if (userAgent.includes('Win')) name = 'Windows'
    else if (userAgent.includes('Mac')) name = 'MacOS'
    else if (userAgent.includes('X11') || userAgent.includes('Linux')) name = 'Linux'
    else if (userAgent.includes('Android')) name = 'Android'
    else if (userAgent.includes('like Mac')) name = 'iOS'
  } catch (err) {
    if (debug) {
      console.error(err)
    }
  }
  return { name }
}

export function getWindowSize(): WindowSize {
  return {
    width: window.innerWidth,
    height: window.innerHeight,
  }
}
