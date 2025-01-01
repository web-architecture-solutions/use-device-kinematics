import { useMemo } from 'react'

import useDeviceMotion from './hooks/useDeviceMotion'
import useDeviceOrienation from './hooks/useDeviceOrientation'
import useGeolocation from './hooks/useGeolocation'

/**
 * Custom hook to capture and process telemetry data (device motion and geolocation).
 * @param {Object} config - Configuration options.
 * @returns {Object} Processed telemetry data and errors.
 */
export default function useSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)
  const errors = useMemo(
    () => ({ ...motion.errors, ...orientation.errors, ...geolocation.errors }),
    [motion.errors, orientation.errors, geolocation.errors]
  )
  const isListening = motion.isListening || orientation.isListening
  const startListening = () => {
    motion.startListening()
    orientation.startListening()
  }
  return {
    data: { ...motion.data, ...orientation.data, ...geolocation.data },
    errors,
    isListening,
    startListening
  }
}
