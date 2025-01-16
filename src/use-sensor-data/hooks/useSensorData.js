import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import usePrevious from '../../hooks/usePrevious'

import SensorData from '../SensorData'

export default function useSensorData(config = {}, deltaT, previousDerivativesWrtT = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const rawSensorData = useMemo(
    () => ({
      position: {
        latitude: geolocation.data?.latitude,
        longitude: geolocation.data?.longitude,
        altitude: geolocation.data?.altitude
      },
      acceleration: {
        x: motion.data?.acceleration.x,
        y: motion.data?.acceleration.y,
        z: motion.data?.acceleration.z
      },
      orientation: {
        alpha: orientation.data?.alpha,
        beta: orientation.data?.beta,
        gamma: orientation.data?.gamma
      },
      angularVelocity: {
        alpha: motion.data?.rotationRate.alpha,
        beta: motion.data?.rotationRate.beta,
        gamma: motion.data?.rotationRate.gamma
      }
    }),
    [
      geolocation.data?.latitude,
      geolocation.data?.longitude,
      geolocation.data?.altitude,
      motion.data?.acceleration.x,
      motion.data?.acceleration.y,
      motion.data?.acceleration.z,
      orientation.data?.alpha,
      orientation.data?.beta,
      orientation.data?.gamma,
      motion.data?.rotationRate.alpha,
      motion.data?.rotationRate.beta,
      motion.data?.rotationRate.gamma
    ]
  )

  const previousRawSensorData = usePrevious(rawSensorData, SensorData.initial, SensorData.isEqual)

  const previousSensorData = useMemo(
    () => ({ ...previousRawSensorData, ...previousDerivativesWrtT }),
    [previousRawSensorData, previousDerivativesWrtT]
  )

  const sensorData = useMemo(
    () =>
      new SensorData(rawSensorData, previousSensorData, deltaT, {
        position: { latitude: 'y', longitude: 'x', altitude: 'z' },
        orientation: { alpha: 'yaw', beta: 'pitch', gamma: 'roll' },
        angularVelocity: { alpha: 'z', beta: 'x', gamma: 'y' }
      }),
    [rawSensorData, previousRawSensorData, deltaT]
  )

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
    sensorData,
    previousSensorData,
    errors,
    isListening,
    startListening
  }
}
