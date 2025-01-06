import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent
const featureDetectionError = { type: 'devicemotion', message: 'DeviceMotionEvent is not supported by this browser.' }

const listenerFactory = (setData) => (event) => {
  setData({
    acceleration: event.acceleration,
    accelerationIncludingGravity: event.accelerationIncludingGravity,
    rotationRate: event.rotationRate,
    interval: event.interval
  })
}

export default function useDeviceMotion({ debounce = 0 } = {}) {
  const handler = (listener, setIsListening) => {
    window.addEventListener('devicemotion', listener)
    setIsListening(true)

    return () => {
      window.removeEventListener('devicemotion', listener)
      setIsListening(false)
    }
  }

  return useDeviceAPI({
    listenerFactory,
    isFeaturePresent,
    featureDetectionError,
    handler,
    options: { debounce },
    requestPermission: DeviceMotionEvent?.requestPermission,
    thunkCleanup: true
  })
}
