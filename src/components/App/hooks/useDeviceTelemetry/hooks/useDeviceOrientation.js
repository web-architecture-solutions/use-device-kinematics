import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceOrientationEvent
const featureDetectionError = { type: 'deviceorientation', message: 'DeviceOrientationEvent is not supported by this browser.' }

export default function useDeviceOrientation({ debounce = 0 } = {}) {
  const listener =
    (setData) =>
    ({ absolute, alpha, beta, gamma }) => {
      setData({
        absolute,
        alpha,
        beta,
        gamma
      })
    }

  const handler = (listener, _, setIsListening) => {
    window.addEventListener('deviceorientation', listener)
    setIsListening(true)

    return () => {
      window.removeEventListener('deviceorientation', listener)
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
