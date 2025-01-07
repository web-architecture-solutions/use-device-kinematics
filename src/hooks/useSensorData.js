import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

function transformSensorData(motionData, orientationData, geolocationData) {
  const data = {
    linearAcceleration: motionData?.acceleration,
    linearAccelerationIncludingGravity: motionData?.accelerationIncludingGravity,
    angularVelocity: motionData?.rotationRate,
    motionInterval: motionData?.interval,
    geolocationTimestamp: geolocationData?.timestamp
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

  return data
}

export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

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
    data: transformSensorData(motion.data, orientation.data, geolocation.data),
    errors,
    isListening,
    startListening
  }
}
