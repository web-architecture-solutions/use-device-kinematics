import { useCallback, useEffect, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import usePrevious from './usePrevious'
import useClock from './useClock'

import DeviceKinematics from '../lib/DeviceKinematics'

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const { timestamp, previousTimestamp } = useClock(motion.data && orientation.data && geolocation.data)

  const sensorData = useMemo(
    () => ({
      position: {
        latitude: geolocation.data?.latitude ?? null,
        longitude: geolocation.data?.longitude ?? null,
        altitude: geolocation.data?.altitude ?? null
      },
      acceleration: {
        x: motion.data?.acceleration.x ?? null,
        y: motion.data?.acceleration.y ?? null,
        z: motion.data?.acceleration.z ?? null
      },
      orientation: {
        alpha: orientation.data?.alpha ?? null,
        beta: orientation.data?.beta ?? null,
        gamma: orientation.data?.gamma ?? null
      },
      angularVelocity: {
        alpha: motion.data?.rotationRate.alpha ?? null,
        beta: motion.data?.rotationRate.beta ?? null,
        gamma: motion.data?.rotationRate.gamma ?? null
      }
    }),
    [motion.data, orientation.data, geolocation.data]
  )

  const previousSensorData = usePrevious(sensorData, (current, value) => {
    return Object.entries(current).every(([variableName, variableValue]) => {
      return value[variableName] === variableValue
    })
  })

  const stateVector = useMemo(() => {
    return new DeviceKinematics(sensorData, previousSensorData, timestamp - previousTimestamp).stateVector
  }, [sensorData])

  const errors = useMemo(
    () => ({ ...motion.errors, ...orientation.errors, ...geolocation.errors }),
    [motion.errors, orientation.errors, geolocation.errors]
  )

  const isListening = useMemo(
    () => motion.isListening || orientation.isListening || geolocation.isListening,
    [motion.isListening, orientation.isListening, geolocation.isListening]
  )

  const startListening = useCallback(async () => {
    await Promise.all([motion.startListening(), orientation.startListening(), geolocation.startListening()])
  }, [motion.startListening, orientation.startListening, geolocation.startListening])

  return {
    data: stateVector,
    errors,
    isListening,
    startListening
  }
}
