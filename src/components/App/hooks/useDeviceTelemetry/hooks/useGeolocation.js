import useDeviceAPI from './useDeviceAPI'

import { calculateComponentVelocity, calculateDisplacement, calculateTotalVelocity } from '../physics'
import { useState } from 'react'

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
  const [previousCoords, setPreviousCoords] = useState({})
  const [currentCoords, setCurrentCoords] = useState({})

  function update(setData) {
    return ({ coords, timestamp }) => {
      setPreviousCoords(currentCoords)

      const newCoords = {
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        heading: coords.heading,
        timestamp
      }

      setCurrentCoords(newCoords)

      //const timeDiff = (timestamp - previousCoords.timestamp) / 1000
      //const { deltaLat, deltaLon } = calculateDisplacement(currentCoords, previousCoords)
      //const { latitudinalVelocity, longitudinalVelocity } = calculateComponentVelocity(deltaLat, deltaLon, timeDiff)
      //const totalVelocity = calculateTotalVelocity(latitudinalVelocity, longitudinalVelocity)
      //const velocity = coords.speed ?? totalVelocity

      setData({
        currentCoords,
        previousCoords,
        latitude: coords.latitude,
        longitude: coords.longitude,
        accuracy: coords.accuracy,
        altitude: coords.altitude,
        altitudeAccuracy: coords.altitudeAccuracy,
        //deltaLat,
        //deltaLon,
        heading: coords.heading,
        //velocity,
        timestamp
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
