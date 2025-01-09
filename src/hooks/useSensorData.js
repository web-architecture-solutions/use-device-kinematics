import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import useClock from './useClock'

import useVelocityFromPosition from './useVelocityFromPosition'

/*
import useHeading from './useHeading'

// TODO: migrate these to use component physics helpers instead of total
import useTotalAngularVelocity from './useTotalAngularVelocity'
import useTotalAccleration from './useTotalAcceleration'

import useTotalJerk from './useTotalJerk'
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

  /*
  const totalAngularVelocity = useTotalAngularVelocity({
    alpha: motion.data?.rotationRate.alpha,
    beta: motion.data?.rotationRate.beta,
    gamma: motion.data?.rotationRate.gamma
  })

  const totalAcceleration = useTotalAccleration({
    x: motion.data?.acceleration.x,
    y: motion.data?.acceleration.y,
    z: motion.data?.acceleration.z
  })

  const totalJerk = useTotalJerk({ totalAcceleration, timeInterval: timestamp - previousTimestamp })

  const curvatureFromAcceleration = useTotalCurvatureFromAcceleration({ totalAcceleration, totalVelocity })
  const curvatureFromAngularVelocity = useTotalCurvatureFromAngularVelocity({ totalAngularVelocity, totalVelocity })

  const heading = useHeading({ alpha: orientation.data?.alpha, beta: orientation.data?.beta, gamma: orientation.data?.gamma })
  */

  const calculatedData = useMemo(
    () => ({
      xVelocityFromPosition,
      yVelocityFromPosition,
      totalVelocityFromPosition,
      timestamp
    }),
    [xVelocityFromPosition, yVelocityFromPosition, totalVelocityFromPosition, timestamp]
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
