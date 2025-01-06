import useDeviceAPI from './useDeviceAPI'

const listenerType = 'deviceorientation'
const isFeaturePresent = typeof window !== 'undefined' && window.DeviceOrientationEvent
const featureDetectionError = { type: listenerType, message: 'DeviceOrientationEvent is not supported by this browser.' }

function listenerFactory(setData) {
  return ({ absolute, alpha, beta, gamma }) => {
    setData({
      absolute,
      alpha,
      beta,
      gamma
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

export default function useDeviceOrientation({ debounce = 0 } = {}) {
  return useDeviceAPI({
    listenerFactory,
    isFeaturePresent,
    featureDetectionError,
    handlerFactory,
    options: { debounce },
    requestPermission: DeviceOrientationEvent?.requestPermission,
    useEvent: true
  })
}
