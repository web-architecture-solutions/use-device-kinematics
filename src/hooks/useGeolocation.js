import useDeviceAPI from './useDeviceAPI'

const listenerType = 'geolocation'
const isFeaturePresent = typeof navigator !== 'undefined' && navigator.geolocation
const featureDetectionError = { type: listenerType, message: 'Geolocation is not supported by this browser.' }

const requestPermission = async () => {
  return new Promise((resolve) => {
    navigator.permissions.query({ name: listenerType }).then(({ state }) => {
      if (state === 'granted' || state === 'denied') {
        resolve(state)
      } else {
        navigator.geolocation.getCurrentPosition(
          () => resolve('granted'),
          () => resolve('denied')
        )
      }
    })
  })
}

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
    const handleError = ({ message }) => errors.add(listenerType, message)

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
    useEvent: false,
    requestPermission
  })
}

export default useGeolocation
