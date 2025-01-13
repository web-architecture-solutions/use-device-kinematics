import useDeviceAPI from './useDeviceAPI'

const listenerType = 'deviceorientation'
const isFeaturePresent = typeof window !== 'undefined' && window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission
const featureDetectionError = 'DeviceOrientationEvent is not supported by this browser.'

const requestPermission = DeviceOrientationEvent?.requestPermission

const listener = ({ absolute, alpha, beta, gamma }) => ({ absolute, alpha, beta, gamma })

function handler(listener, setIsListening) {
  window.addEventListener(listenerType, listener)

  setIsListening(true)

  return () => {
    window.removeEventListener(listenerType, listener)
    setIsListening(false)
  }
}

const useDeviceOrientation = ({ debounce = 0 } = {}) =>
  useDeviceAPI({
    listenerType,
    isFeaturePresent,
    featureDetectionError,
    requestPermission,
    listener,
    handler,
    debounce,
    useEvent: true
  })

export default useDeviceOrientation
