import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

const initialAcceleration = { x: null, y: null, z: null }
const initialRotationRate = { alpha: null, beta: null, gamma: null }

export default function useRawSensorData(config) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  const rawSensorData = useMemo(
    () => ({
      latitude: geolocation.data?.latitude ?? null,
      longitude: geolocation.data?.longitude ?? null,
      altitude: geolocation.data?.altitude ?? null,
      acceleration: motion.data?.acceleration.x ?? initialAcceleration,
      alpha: orientation.data?.alpha ?? null,
      beta: orientation.data?.beta ?? null,
      gamma: orientation.data?.gamma ?? null,
      rotationRate: motion.data?.rotationRate ?? initialRotationRate
    }),
    [geolocation.data, motion.data, orientation.data]
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
    rawSensorData,
    errors,
    isListening,
    startListening
  }
}
