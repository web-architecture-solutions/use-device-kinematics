import useDeviceAPI from './useDeviceAPI'

const listenerType = 'devicemotion'
const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission
const featureDetectionError = 'DeviceMotionEvent is not supported by this browser.'

const requestPermission = DeviceMotionEvent?.requestPermission

const listener = ({ acceleration, accelerationIncludingGravity, rotationRate, interval }) => ({
  acceleration,
  accelerationIncludingGravity,
  rotationRate,
  interval
})

function handler(listener, setIsListening) {
  window.addEventListener(listenerType, listener)
  
  setIsListening(true)

  return () => {
    window.removeEventListener(listenerType, listener)
    setIsListening(false)
  }
}

const useDeviceMotion = ({ debounce = 0 } = {}) =>
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

export default useDeviceMotion
