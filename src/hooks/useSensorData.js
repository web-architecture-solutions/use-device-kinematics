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

  const startListening = useCallback(() => {
    motion.startListening()
    orientation.startListening()
    geolocation.startListening()
  }, [motion.startListening, orientation.startListening, geolocation.startListening])

  return {
    data: {
      linearAcceleration: motion.data?.acceleration,
      linearAccelerationIncludingGravity: motion.data?.accelerationIncludingGravity,
      angularVelocity: motion.data?.rotationRate,
      motionInterval: motion.data?.interval,
      orientation: {
        yaw: orientation.data?.alpha,
        pitch: orientation.data?.beta,
        roll: orientation.data?.gamma
      },
      position: {
        latitude: geolocation.data?.latitude,
        longitude: geolocation.data?.longitude,
        altitude: geolocation.data?.altitude,
        accuracy: geolocation.data?.accuracy,
        altitudeAccuracy: geolocation.data?.altitudeAccuracy
      },
      velocity: {
        heading: geolocation.data?.heading,
        speed: geolocation.data?.speed
      },
      geolocationTimestamp: geolocation.data?.timestamp
    },
    errors,
    isListening,
    startListening
  }
}
