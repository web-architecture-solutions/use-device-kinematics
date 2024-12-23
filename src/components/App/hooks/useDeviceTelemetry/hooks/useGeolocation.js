import { useRef } from 'react'

import useDeviceAPI from './useDeviceAPI'

import { calculateComponentVelocity, calculateDisplacement, calculateTotalVelocity } from '../physics'

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
  const previousCoords = useRef(null)

  function update(setData) {
    return ({ coords, timestamp }) => {
      let latitudinalVelocity = null
      let longitudinalVelocity = null
      let velocity = null
      let deltaLat = null
      let deltaLon = null

      if (previousCoords.current && coords) {
        const displacement = calculateDisplacement(previousCoords.current, { ...coords, timestamp })
        deltaLat = displacement.deltaLat
        deltaLon = displacement.deltaLon

        const velocityComponents = calculateComponentVelocity(deltaLat, deltaLon, (timestamp - previousCoords.current.timestamp) / 1000)
        latitudinalVelocity = velocityComponents.latitudinalVelocity
        longitudinalVelocity = velocityComponents.longitudinalVelocity
        velocity = coords.speed ?? calculateTotalVelocity(latitudinalVelocity, longitudinalVelocity)
      } else {
        velocity = coords.speed
      }

      previousCoords.current = { ...coords, timestamp }

      setData({
        latitude: coords.latitude || 0,
        longitude: coords.longitude || 0,
        accuracy: coords.accuracy || 0,
        altitude: coords.altitude || null,
        altitudeAccuracy: coords.altitudeAccuracy || null,
        heading: coords.heading || null,
        velocity: velocity || 0,
        latitudinalVelocity: latitudinalVelocity || 0,
        longitudinalVelocity: longitudinalVelocity || 0,
        deltaLat: deltaLat || 0,
        deltaLon: deltaLon || 0,
        timestamp: timestamp || null
      })
    }
  }

  function callback(handleDeviceEvent, errors) {
    const handleError = ({ message }) => errors.add('geolocation', message)

    const watcherId = navigator.geolocation.watchPosition(handleDeviceEvent, handleError, {
      enableHighAccuracy,
      timeout,
      maximumAge
    })

    return () => navigator.geolocation.clearWatch(watcherId)
  }

  return useDeviceAPI({
    update,
    isFeaturePresent,
    featureDetectionError,
    options: { enableHighAccuracy, timeout, maximumAge, debounce },
    callback
  })
}
