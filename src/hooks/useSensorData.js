import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import useClock from './useClock'
import useHeading from './useHeading'

// TODO: migrate these to use component physics helpers instead of total
import useTotalAngularVelocity from './useTotalAngularVelocity'
import useTotalAccleration from './useTotalAcceleration'
import useTotalVelocity from './useTotalVelocity'
import useTotalJerk from './useTotalJerk'
import useTotalCurvatureFromAcceleration from './useTotalCurvatureFromAcceleration'
import useTotalCurvatureFromAngularVelocity from './useTotalCurvatureFromAngularVelocity'

function transformSensorData({
  motionData,
  orientationData,
  geolocationData,
  timestamp,
  totalAngularVelocity,
  totalAcceleration,
  heading,
  totalVelocity,
  totalJerk,
  curvatureFromAcceleration,
  curvatureFromAngularVelocity
}) {
  const data = {
    linearAcceleration: motionData?.acceleration,
    linearAccelerationIncludingGravity: motionData?.accelerationIncludingGravity,
    angularVelocity: motionData?.rotationRate,
    motionInterval: motionData?.interval,
    geolocationTimestamp: geolocationData?.timestamp,
    timestamp
  }

  if (geolocationData) {
    data.position = {
      latitude: geolocationData?.latitude,
      longitude: geolocationData?.longitude,
      altitude: geolocationData?.altitude,
      accuracy: geolocationData?.accuracy,
      altitudeAccuracy: geolocationData?.altitudeAccuracy
    }

    data.velocity = {
      heading: geolocationData?.heading,
      speed: geolocationData?.speed
    }
  }

  if (orientationData) {
    data.orientation = {
      yaw: orientationData.alpha,
      pitch: orientationData.beta,
      roll: orientationData.gamma
    }
  }

  data.debug = {
    totalAngularVelocity,
    totalAcceleration,
    heading,
    totalVelocity,
    totalJerk,
    curvatureFromAcceleration,
    curvatureFromAngularVelocity
  }

  return data
}

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const totalAngularVelocity = useTotalAngularVelocity({
    alpha: motion.data?.rotationRate.alpha,
    beta: motion.data?.rotationRate.beta,
    gamma: motion.data?.rotationRate.gamma
  })

  const [timestamp, previousTimestamp] = useClock()

  const totalVelocity = useTotalVelocity({
    latitude: geolocation.data?.latitude,
    longitude: geolocation.data?.longitude,
    timeInterval: timestamp - previousTimestamp
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
    data: transformSensorData({
      motionData: motion.data,
      orientationData: orientation.data,
      geolocationData: geolocation.data,
      timestamp,
      totalAngularVelocity,
      totalAcceleration,
      heading,
      totalVelocity,
      totalJerk,
      curvatureFromAcceleration,
      curvatureFromAngularVelocity
    }),
    errors,
    isListening,
    startListening
  }
}
