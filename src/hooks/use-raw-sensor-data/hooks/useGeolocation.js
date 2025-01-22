import useDeviceAPI from '../../use-device-api'

const listenerType = 'geolocation'
const isFeaturePresent = Boolean(typeof navigator !== 'undefined' && navigator.geolocation)
const featureDetectionError = 'Geolocation is not supported by this browser.'

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

const initialPosition = { latitude: null, longitude: null, altitude: null }

const listener = ({ coords, timestamp }) => ({
  latitude: coords.latitude,
  longitude: coords.longitude,
  accuracy: coords.accuracy,
  altitude: coords.altitude,
  altitudeAccuracy: coords.altitudeAccuracy,
  heading: coords.heading,
  speed: coords.speed,
  timestamp
})

function handlerFactory(options) {
  return (listener, setIsListening, errors) => {
    const handleError = ({ message }) => errors.add(listenerType, message)
    const watcherId = navigator.geolocation.watchPosition(listener, handleError, options)

    setIsListening(true)

    return () => {
      navigator.geolocation.clearWatch(watcherId)
      setIsListening(false)
    }
  }
}

const useGeolocation = ({ enableHighAccuracy = false, timeout = Infinity, maximumAge = 0, debounce = 0 } = {}) =>
  useDeviceAPI({
    listenerType,
    isFeaturePresent,
    featureDetectionError,
    requestPermission,
    listener,
    handler: handlerFactory({
      enableHighAccuracy,
      timeout,
      maximumAge
    }),
    debounce,
    useEvent: false,
    initialData: initialPosition
  })

export default useGeolocation
