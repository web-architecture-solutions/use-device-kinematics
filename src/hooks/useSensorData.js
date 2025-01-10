import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import useClock from './useClock'

import useVelocityFromPosition from './useVelocityFromPosition'
import useHeading from './useHeading'
import useTotalAccelerationFromComponents from './useTotalAccelerationFromComponents'
import useJerkFromAcceleration from './useJerkFromAcceleration'
import useTotalAngularVelocityFromComponents from './useTotalAngularVelocityFromComponents'

/*
import useTotalCurvatureFromAcceleration from './useTotalCurvatureFromAcceleration'
import useTotalCurvatureFromAngularVelocity from './useTotalCurvatureFromAngularVelocity'
*/

export default function useSensorData(config = {}) {
  const [timestamp, previousTimestamp] = useClock()

  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const { xVelocityFromPosition, yVelocityFromPosition, totalVelocityFromPosition } = useVelocityFromPosition(
    geolocation.data?.latitude ?? null,
    geolocation.data?.longitude ?? null,
    timestamp - previousTimestamp
  )

  const heading = useHeading(orientation.data?.alpha)

  const totalAcceleration = useTotalAccelerationFromComponents(
    motion.data?.acceleration?.x ?? null,
    motion.data?.acceleration?.y ?? null,
    motion.data?.acceleration?.z ?? null
  )

  const { xJerk, yJerk, totalJerk } = useJerkFromAcceleration(
    motion.data?.acceleration?.x ?? null,
    motion.data?.acceleration?.y ?? null,
    motion.data?.acceleration?.z ?? null,
    totalAcceleration ?? null,
    timestamp - previousTimestamp
  )

  const totalAngularVelocity = useTotalAngularVelocityFromComponents(
    motion.data?.rotationRate?.alpha ?? null,
    motion.data?.rotationRate?.beta ?? null,
    motion.data?.rotationRate?.gamma ?? null
  )

  /*
  const curvatureFromAcceleration = useTotalCurvatureFromAcceleration({ totalAcceleration, totalVelocity })
  const curvatureFromAngularVelocity = useTotalCurvatureFromAngularVelocity({ totalAngularVelocity, totalVelocity })

  
  */

  const calculatedData = useMemo(
    () => ({
      xVelocityFromPosition,
      yVelocityFromPosition,
      totalVelocityFromPosition,
      heading,
      totalAcceleration,
      xJerk,
      yJerk,
      totalJerk,
      totalAngularVelocity,
      timestamp
    }),
    [
      xVelocityFromPosition,
      yVelocityFromPosition,
      totalVelocityFromPosition,
      heading,
      totalAcceleration,
      xJerk,
      yJerk,
      totalJerk,
      totalAngularVelocity,
      timestamp
    ]
  )

  const data = useMemo(
    () => ({
      ...motion?.data,
      ...orientation?.data,
      ...geolocation?.data,
      ...calculatedData
    }),
    [motion.data, orientation.data, geolocation.data, calculatedData]
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
    data,
    errors,
    isListening,
    startListening
  }
}
