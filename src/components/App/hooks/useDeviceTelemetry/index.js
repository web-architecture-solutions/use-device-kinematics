import { useMemo } from 'react'

import useDeviceMotion from './hooks/useDeviceMotion'
import useGeolocation from './hooks/useGeolocation'

/**
 * Custom hook to capture and process telemetry data (device motion and geolocation).
 * @param {Object} config - Configuration options.
 * @returns {Object} Processed telemetry data and errors.
 */
export default function useDeviceTelemetry(config = {}) {
  const motion = useDeviceMotion(config)
  const geolocation = useGeolocation(config)
  const combinedErrors = useMemo(() => ({ ...motion.errors, ...geolocation.errors }), [motion.errors, geolocation.errors])
  return { motionData: motion.data, geolocationData: geolocation.data, errors: combinedErrors }
}
