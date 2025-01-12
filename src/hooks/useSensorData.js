import { useCallback, useEffect, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import usePrevious from './usePrevious'
import useClock from './useClock'

import DeviceKinematics from '../lib/DeviceKinematics'

const initialSensorData = {
  position: { x: null, y: null, z: null },
  acceleration: { x: null, y: null, z: null },
  orientation: { yaw: null, pitch: null, roll: null },
  angularVelocity: { alpha: null, beta: null, gamma: null }
}

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const { timestamp, previousTimestamp } = useClock(motion.data && orientation.data && geolocation.data)

  const sensorData = useMemo(
    () => ({
      position: {
        x: geolocation.data?.longitude,
        y: geolocation.data?.latitude,
        z: geolocation.data?.altitude
      },
      acceleration: { ...motion.data?.acceleration },
      orientation: {
        yaw: orientation.data?.alpha,
        pitch: orientation.data?.beta,
        roll: orientation.data?.gamma
      },
      angularVelocity: { ...motion.data?.rotationRate }
    }),
    [motion.data, orientation.data, geolocation.data]
  )

  const previousSensorData = usePrevious(initialSensorData, sensorData)

  const stateVector = useMemo(() => {
    return new DeviceKinematics(
      Object.fromEntries(
        Object.keys(sensorData).map((variableName) => [
          variableName,
          { ...sensorData[variableName], previous: previousSensorData[variableName] }
        ])
      ),
      timestamp - previousTimestamp
    ).stateVector
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
