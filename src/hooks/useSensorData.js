import { useMemo } from 'react'

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
  const isListening = motion.isListening || orientation.isListening || geolocation.isListening

  const startListening = () => {
    if (motion.startListening && typeof motion.startListening === 'function') motion.startListening()
    if (orientation.startListening && typeof orientation.startListening === 'function') orientation.startListening()
    if (geolocation.startListening && typeof geolocation.startListening === 'function') geolocation.startListening()
  }

  return {
    data: {
      linearAcceleration: motion.data?.acceleration,
      linearAccelerationIncludingGravity: motion.data?.accelerationIncludingGravity,
      angularAcceleration: motion.data?.rotationRate,
      accelerationInterval: motion.data?.interval,
      yaw: orientation.data?.alpha,
      pitch: orientation.data?.beta,
      roll: orientation.data?.gamma,
      latitude: geolocation.data?.latitude,
      longitude: geolocation.data?.longitude,
      geolocationAccuracy: geolocation.data?.accuracy,
      altitude: geolocation.data?.altitude,
      geolocationAltitudeAccuracy: geolocation.data?.altitudeAccuracy,
      heading: geolocation.data?.heading,
      speed: geolocation.data?.speed,
      timestamp: geolocation.data?.timestamp
    },
    errors,
    isListening,
    startListening
  }
}
