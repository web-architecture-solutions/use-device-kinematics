import { useCallback, useMemo, useEffect, useState } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import useCurvature from './useCurvature'
import useTotalAngularVelocity from './useTotalAngularVelocity'
import useTotalAccleration from './useTotalAcceleration'
import useClock from './useClock'
import useIntegratedVelocity from './useIntegratedVelocity'
import useHeading from './useHeading'

import { calculateVelocityFromAngularVelocityAndCurvature } from '../physics'

function transformSensorData({
  motionData,
  orientationData,
  geolocationData,
  timestamp,
  points,
  curvature,
  totalAngularVelocity,
  velocity,
  totalAcceleration,
  accelerationSamples,
  velocity2,
  heading
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
    points,
    curvature,
    totalAngularVelocity,
    velocity,
    totalAcceleration,
    accelerationSamples,
    velocity2,
    heading
  }

  return data
}

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const [velocity, setVelocity] = useState(null)

  const { curvature, points } = useCurvature({ latitude: geolocation.data?.latitude, longitude: geolocation.data?.longitude })

  const totalAngularVelocity = useTotalAngularVelocity({
    alpha: motion.data?.rotationRate.alpha,
    beta: motion.data?.rotationRate.beta,
    gamma: motion.data?.rotationRate.gamma
  })

  const timestamp = useClock()

  const totalAcceleration = useTotalAccleration({
    x: motion.data?.acceleration.x,
    y: motion.data?.acceleration.y,
    z: motion.data?.acceleration.z
  })

  useEffect(() => {
    const _velocity = curvature ? calculateVelocityFromAngularVelocityAndCurvature(totalAngularVelocity, curvature) : null
    setVelocity(_velocity)
  }, [totalAngularVelocity, curvature])

  const { velocity: velocity2, accelerationSamples } = useIntegratedVelocity({ totalAcceleration, timestamp })

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
      points,
      curvature,
      totalAngularVelocity,
      velocity,
      totalAcceleration,
      accelerationSamples,
      velocity2,
      heading
    }),
    errors,
    isListening,
    startListening
  }
}
