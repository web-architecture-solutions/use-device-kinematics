import useDeviceAPI from './useDeviceAPI'

const isFeaturePresent = typeof navigator !== 'undefined' && navigator.geolocation
const featureDetectionError = { type: 'geolocation', message: 'Geolocation is not supported by this browser.' }

/**
 * Custom hook to capture geolocation data with optional configuration.
 * @param {Object} config - Configuration options for the hook.
 * @param {boolean} [config.enableHighAccuracy=false] - Whether to use high-accuracy geolocation.
 * @param {number} [config.timeout=Infinity] - Timeout for geolocation requests.
 * @param {number} [config.maximumAge=0] - Maximum age of cached location data in milliseconds.
 * @param {number} [config.debounce=0] - Debounce delay for location updates.
 * @returns {Object} Geolocation data and errors.
 */
export default function useGeolocation({ enableHighAccuracy = false, timeout = Infinity, maximumAge = 0, debounce = 0 } = {}) {
  const listener =
    (setData) =>
    ({ coords, timestamp }) =>
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

  function handler(listener, _, errors) {
    const handleError = ({ message }) => errors.add('geolocation', message)

    const watcherId = navigator.geolocation.watchPosition(listener, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    })

    return () => navigator.geolocation.clearWatch(watcherId)
  }

  return useDeviceAPI({
    listener,
    isFeaturePresent,
    featureDetectionError,
    options: { enableHighAccuracy, timeout, maximumAge, debounce },
    handler
  })
}
