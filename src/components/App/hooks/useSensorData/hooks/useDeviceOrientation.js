import useDeviceAPI from './useDeviceAPI'

const listenerType = 'deviceorientation'
const isFeaturePresent = typeof window !== 'undefined' && window.DeviceOrientationEvent
const featureDetectionError = { type: listenerType, message: 'DeviceOrientationEvent is not supported by this browser.' }

export default function useDeviceOrientation({ debounce = 0 } = {}) {
  const listener =
    (setData) =>
    ({ absolute, alpha, beta, gamma }) =>
      setData({
        absolute,
        alpha,
        beta,
        gamma
      })

  const handler = (listener, setIsListening) => {
    window.addEventListener(listenerType, listener)
    setIsListening(true)

    return () => {
      window.removeEventListener(listenerType, listener)
      setIsListening(false)
    }
  }

  return useDeviceAPI({
    listener,
    isFeaturePresent,
    featureDetectionError,
    handler,
    options: { debounce },
    requestPermission: DeviceOrientationEvent?.requestPermission
  })
}
