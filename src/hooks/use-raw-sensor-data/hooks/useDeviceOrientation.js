import useDeviceAPI from '../../use-device-api'

const listenerType = 'deviceorientation'
const isFeaturePresent = Boolean(
  typeof window !== 'undefined' && window.DeviceOrientationEvent && window.DeviceOrientationEvent.requestPermission
)
const featureDetectionError = 'DeviceOrientationEvent is not supported by this browser.'

const requestPermission = DeviceOrientationEvent?.requestPermission

const initialOrientation = { alpha: null, beta: null, gamma: null }

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
    useEvent: true,
    initialData: initialOrientation
  })

export default useDeviceOrientation
