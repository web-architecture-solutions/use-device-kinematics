import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

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

  const data = {
    linearAcceleration: motion.data?.acceleration,
    linearAccelerationIncludingGravity: motion.data?.accelerationIncludingGravity,
    angularVelocity: motion.data?.rotationRate,
    motionInterval: motion.data?.interval,
    geolocationTimestamp: geolocation.data?.timestamp
  }

  if (geolocation.data) {
    data.position = {
      latitude: geolocation.data?.latitude,
      longitude: geolocation.data?.longitude,
      altitude: geolocation.data?.altitude,
      accuracy: geolocation.data?.accuracy,
      altitudeAccuracy: geolocation.data?.altitudeAccuracy
    }

    data.velocity = {
      heading: geolocation.data?.heading,
      speed: geolocation.data?.speed
    }
  }

  if (orientation.data) {
    data.orientation = {
      yaw: orientation.data.alpha,
      pitch: orientation.data.beta,
      roll: orientation.data.gamma
    }
  }

  return {
    data,
    errors,
    isListening,
    startListening
  }
}
