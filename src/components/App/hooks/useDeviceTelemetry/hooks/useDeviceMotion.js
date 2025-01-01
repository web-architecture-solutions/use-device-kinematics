import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent
const featureDetectionError = { type: 'devicemotion', message: 'DeviceMotionEvent is not supported by this browser.' }

export default function useDeviceMotion({ debounce = 0 } = {}) {
  const listener = (setData) => (event) => {
    setData({
      acceleration: event.acceleration,
      accelerationIncludingGravity: event.accelerationIncludingGravity,
      rotationRate: event.rotationRate,
      interval: event.interval
    })
  }

  const handler = (listener, setIsListening) => {
    window.addEventListener('devicemotion', listener)
    setIsListening(true)

    return () => {
      window.removeEventListener('devicemotion', listener)
      setIsListening(false)
    }
  }

  return useDeviceAPI({
    listener,
    isFeaturePresent,
    featureDetectionError,
    handler,
    options: { debounce },
    requestPermission: DeviceMotionEvent?.requestPermission
  })
}
