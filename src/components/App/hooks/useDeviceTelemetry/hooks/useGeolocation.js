import { useRef } from 'react'

import useDeviceAPI from './useDeviceAPI'

import { calculateVelocity } from '../physics'

const isFeaturePresent = typeof navigator !== 'undefined' && navigator.geolocation

const featureDetectionError = { type: 'geolocation', message: 'Geolocation is not supported by this browser.' }

function callback(handleDeviceEvent, errors) {
  const handleError = ({ message }) => errors.add('geolocation', message)
  const watcherId = navigator.geolocation.watchPosition(handleDeviceEvent, handleError, {
    enableHighAccuracy,
    timeout,
    maximumAge
  })
  return () => navigator.geolocation.clearWatch(watcherId)
}

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
  const previousCoords = useRef(null)

  const calulateFallbackVelocity = (coords) =>
    previousCoords.current && coords
      ? calculateVelocity({ ...previousCoords.current, timestamp: previousCoords.current.timestamp }, { ...coords, timestamp })
      : null

  function update(setData) {
    return ({ coords, timestamp }) => {
      previousCoords.current = { ...coords, timestamp }
      setData({
        latitude: coords.latitude || 0,
        longitude: coords.longitude || 0,
        accuracy: coords.accuracy || 0,
        altitude: coords.altitude || null,
        altitudeAccuracy: coords.altitudeAccuracy || null,
        heading: coords.heading || null,
        speed: (coords.speed ?? calulateFallbackVelocity(coords)) || null,
        timestamp
      })
    }
  }

  return useDeviceAPI({
    update,
    isFeaturePresent,
    featureDetectionError,
    options: { enableHighAccuracy, timeout, maximumAge, debounce },
    callback
  })
}
