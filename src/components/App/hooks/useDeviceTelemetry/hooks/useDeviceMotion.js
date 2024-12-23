import { useRef } from 'react'

import useDeviceAPI from './useDeviceAPI'

import { calculateAngularAcceleration } from '../physics'

const isFeaturePresent = typeof window !== 'undefined' && window.DeviceMotionEvent

const featureDetectionError = { type: 'deviceMotion', message: 'DeviceMotionEvent is not supported by this browser.' }

function callback(handleDeviceEvent) {
  window.addEventListener('devicemotion', handleDeviceEvent)
  return () => window.removeEventListener('devicemotion', handleDeviceEvent)
}

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

      const angularAcceleration =
        angularVelocity && previousAngularVelocity.current
          ? calculateAngularAcceleration(angularVelocity, previousAngularVelocity.current, timeDiff)
          : { alpha: 0, beta: 0, gamma: 0 }

      previousAngularVelocity.current = angularVelocity
      previousTimestamp.current = timestamp

      setData({
        acceleration: acceleration || { x: 0, y: 0, z: 0 },
        accelerationIncludingGravity: accelerationIncludingGravity || { x: 0, y: 0, z: 0 },
        angularVelocity: angularVelocity || { alpha: 0, beta: 0, gamma: 0 },
        angularAcceleration,
        timestamp
      })
    }
  }

  return useDeviceAPI({
    update,
    isFeaturePresent,
    featureDetectionError,
    options: { debounce },
    callback
  })
}
