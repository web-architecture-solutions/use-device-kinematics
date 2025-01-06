import useDeviceAPI from './useDeviceAPI'

const listenerType = 'devicemotion'
const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent && window.DeviceMotionEvent.requestPermission
const featureDetectionError = { type: listenerType, message: 'DeviceMotionEvent is not supported by this browser.' }

function listenerFactory(setData) {
  return ({ acceleration, accelerationIncludingGravity, rotationRate, interval }) => {
    setData({
      acceleration,
      accelerationIncludingGravity,
      rotationRate,
      interval
    })
  }
}

function handlerFactory() {
  return (listener, setIsListening) => {
    window.addEventListener(listenerType, listener)
    setIsListening(true)

    return () => {
      window.removeEventListener(listenerType, listener)
      setIsListening(false)
    }
  }
}

export default function useDeviceMotion({ debounce = 0 } = {}) {
  return useDeviceAPI({
    listenerFactory,
    isFeaturePresent,
    featureDetectionError,
    handlerFactory,
    options: { debounce },
    requestPermission: DeviceMotionEvent?.requestPermission,
    useEvent: true
  })
}
