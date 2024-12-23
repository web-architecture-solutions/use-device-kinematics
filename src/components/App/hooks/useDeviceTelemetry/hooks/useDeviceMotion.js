import { useRef } from 'react'

import useDeviceAPI from './useDeviceAPI'

import { calculateTotalAngularAcceleration, calculateComponentAngularAcceleration } from '../physics'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent
const featureDetectionError = { type: 'deviceMotion', message: 'DeviceMotionEvent is not supported by this browser.' }

/**
 * Custom hook to capture device motion data with optional configuration.
 * @param {Object} config - Configuration options for the hook.
 * @param {number} [config.debounce=0] - Debounce delay for motion updates.
 * @returns {Object} Device motion data and errors.
 */
export default function useDeviceMotion({ debounce = 0 } = {}) {
  const previousAngularVelocity = useRef(null)
  const previousTimestamp = useRef(null)

  function update(setData) {
    return ({ acceleration, accelerationIncludingGravity, rotationRate: angularVelocity, timestamp }) => {
      const timeDiff = previousTimestamp.current ? (timestamp - previousTimestamp.current) / 1000 : null

      let totalAngularAcceleration = 0
      let angularAcceleration = { alpha: 0, beta: 0, gamma: 0 }

      if (angularVelocity && previousAngularVelocity.current && timeDiff) {
        const { alpha: currentAlpha, beta: currentBeta, gamma: currentGamma } = angularVelocity
        const { alpha: previousAlpha, beta: previousBeta, gamma: previousGamma } = previousAngularVelocity.current

        angularAcceleration = calculateComponentAngularAcceleration(
          currentAlpha,
          previousAlpha,
          currentBeta,
          previousBeta,
          currentGamma,
          previousGamma,
          timeDiff
        )

        totalAngularAcceleration = calculateTotalAngularAcceleration(
          currentAlpha - previousAlpha,
          currentBeta - previousBeta,
          currentGamma - previousGamma,
          timeDiff
        )
      }

      const totalLinearAcceleration = acceleration
        ? Math.sqrt(Math.pow(acceleration.x || 0, 2) + Math.pow(acceleration.y || 0, 2) + Math.pow(acceleration.z || 0, 2))
        : 0

      previousAngularVelocity.current = angularVelocity
      previousTimestamp.current = timestamp

      setData({
        acceleration: acceleration || { x: 0, y: 0, z: 0 },
        accelerationIncludingGravity: accelerationIncludingGravity || { x: 0, y: 0, z: 0 },
        angularVelocity: angularVelocity || { alpha: 0, beta: 0, gamma: 0 },
        angularAcceleration: angularAcceleration || 0,
        totalAngularAcceleration: totalAngularAcceleration || 0,
        totalLinearAcceleration: totalLinearAcceleration || 0,
        timestamp: timestamp || null
      })
    }
  }

  function callback(handleDeviceEvent) {
    window.addEventListener('devicemotion', handleDeviceEvent)
    return () => window.removeEventListener('devicemotion', handleDeviceEvent)
  }

  return useDeviceAPI({
    update,
    isFeaturePresent,
    featureDetectionError,
    options: { debounce },
    callback
  })
}
