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
    const { userAgent } = navigator

    if (userAgent.includes('Firefox')) {
      name = 'Firefox'
      // eslint-disable-next-line prefer-destructuring
      version = userAgent.split('Firefox/')[1]
    } else if (userAgent.includes('Chrome')) {
      name = 'Chrome'
      // eslint-disable-next-line prefer-destructuring
      version = userAgent.split('Chrome/')[1].split(' ')[0]
    } else if (userAgent.includes('Safari')) {
      name = 'Safari'
      // eslint-disable-next-line prefer-destructuring
      version = userAgent.split('Version/')[1].split(' ')[0]
    } else if (userAgent.includes('MSIE') || userAgent.includes('Trident/')) {
      name = 'Internet Explorer'
      // eslint-disable-next-line prefer-destructuring
      version = userAgent.split('rv:')[1].split(')')[0]
    }
  } catch (error) {
    if (debug) {
      console.error(error)
    }
  }
  return { name, version }
}

export function getOSInfo(): OSInfo {
  let name = 'Unknown'
  try {
    const { userAgent } = navigator
    if (userAgent.includes('Win')) name = 'Windows'
    else if (userAgent.includes('Mac')) name = 'MacOS'
    else if (userAgent.includes('X11') || userAgent.includes('Linux')) name = 'Linux'
    else if (userAgent.includes('Android')) name = 'Android'
    else if (userAgent.includes('like Mac')) name = 'iOS'
  } catch (error) {
    if (debug) {
      console.error(error)
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
