import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof navigator !== 'undefined' && navigator.geolocation
const featureDetectionError = { type: 'geolocation', message: 'Geolocation is not supported by this browser.' }

function listenerFactory(setData) {
  return ({ coords, timestamp }) => {
    setData({
      latitude: coords.latitude,
      longitude: coords.longitude,
      accuracy: coords.accuracy,
      altitude: coords.altitude,
      altitudeAccuracy: coords.altitudeAccuracy,
      heading: coords.heading,
      speed: coords.speed,
      timestamp
    })
  }
}

function handlerFactory({ enableHighAccuracy, timeout, maximumAge }) {
  return (listener, _, errors) => {
    const handleError = ({ message }) => errors.add('geolocation', message)

    const watcherId = navigator.geolocation.watchPosition(listener, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    })

    return () => navigator.geolocation.clearWatch(watcherId)
  }
}

export function useGeolocation({ enableHighAccuracy = false, timeout = Infinity, maximumAge = 0, debounce = 0 } = {}) {
  return useDeviceAPI({
    listenerFactory,
    isFeaturePresent,
    featureDetectionError,
    options: { enableHighAccuracy, timeout, maximumAge, debounce },
    handlerFactory,
    thunkCleanup: false
  })
}

export default useGeolocation
