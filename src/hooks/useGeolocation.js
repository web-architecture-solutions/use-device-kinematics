import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof navigator !== 'undefined' && navigator.geolocation
const featureDetectionError = { type: 'geolocation', message: 'Geolocation is not supported by this browser.' }

const requestPermission = async () => {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve('denied') // Geolocation not supported
      return
    }

    navigator.permissions.query({ name: 'geolocation' }).then((result) => {
      if (result.state === 'granted') {
        resolve('granted')
        return
      }

      if (result.state === 'denied') {
        resolve('denied')
        return
      }

      // If the permission is 'prompt' or 'prompt-no-persist' we need to actually try to get the location.
      navigator.geolocation.getCurrentPosition(
        () => {
          resolve('granted') // Success means permission granted
        },
        (error) => {
          if (error.code === error.PERMISSION_DENIED) {
            resolve('denied') // User denied permission
          } else {
            resolve('denied') // Other errors also treated as denied for simplicity
          }
        },
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 0 } // Add options to getCurrentPosition
      )
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
    useEvent: false,
    requestPermission
  })
}

export default useGeolocation
