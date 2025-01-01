import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent
const featureDetectionError = { type: 'deviceMotion', message: 'DeviceMotionEvent is not supported by this browser.' }

export default function useDeviceMotion({ debounce = 0 } = {}) {
  const listener =
    (setData) =>
    ({ acceleration, accelerationIncludingGravity, rotationRate, interval }) => {
      setData({
        acceleration,
        accelerationIncludingGravity,
        rotationRate,
        interval
      })
    }

  const handler = (listener, _, setIsListening) => {
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
