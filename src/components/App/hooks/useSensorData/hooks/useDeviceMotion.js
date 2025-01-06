import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent
const featureDetectionError = { type: 'devicemotion', message: 'DeviceMotionEvent is not supported by this browser.' }

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
    window.addEventListener('devicemotion', listener)
    setIsListening(true)

    return () => {
      window.removeEventListener('devicemotion', listener)
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
    requestPermission: DeviceMotionEvent?.requestPermission
  })
}
