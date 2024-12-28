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
    return ({
      acceleration = { x: 0, y: 0, z: 0 },
      accelerationIncludingGravity = { x: 0, y: 0, z: 0 },
      rotationRate: angularVelocity = { alpha: 0, beta: 0, gamma: 0 },
      timestamp
    }) => {
      const timeDiff = previousTimestamp.current ? (timestamp - previousTimestamp.current) / 1000 : null

      const angularAcceleration = timeDiff
        ? calculateComponentAngularAcceleration(
            angularVelocity.alpha,
            previousAngularVelocity.current?.alpha || 0,
            angularVelocity.beta,
            previousAngularVelocity.current?.beta || 0,
            angularVelocity.gamma,
            previousAngularVelocity.current?.gamma || 0,
            timeDiff
          )
        : { alpha: 0, beta: 0, gamma: 0 }

      const totalAngularAcceleration = timeDiff
        ? calculateTotalAngularAcceleration(
            angularVelocity.alpha - (previousAngularVelocity.current?.alpha || 0),
            angularVelocity.beta - (previousAngularVelocity.current?.beta || 0),
            angularVelocity.gamma - (previousAngularVelocity.current?.gamma || 0),
            timeDiff
          )
        : 0

      const totalLinearAcceleration = Math.sqrt(acceleration.x ** 2 + acceleration.y ** 2 + acceleration.z ** 2)

      previousAngularVelocity.current = angularVelocity
      previousTimestamp.current = timestamp

      setData({
        acceleration,
        accelerationIncludingGravity,
        angularVelocity,
        angularAcceleration,
        totalAngularAcceleration,
        totalLinearAcceleration,
        timestamp
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
