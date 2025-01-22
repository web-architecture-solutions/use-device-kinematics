import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

export default function useRawSensorData(config = {}) {
  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)
  return {
    rawSensorData: useMemo(
      () => ({ ...geolocation.data, ...motion.data, ...orientation.data }),
      [geolocation.data, motion.data, orientation.data]
    ),
    refreshRates: useMemo(
      () => ({
        geolocation: geolocation.refreshRate,
        motion: motion.refreshRate,
        orientation: orientation.refreshRate
      }),
      [geolocation.refreshRate, motion.refreshRate, orientation.refreshRate]
    ),
    errors: useMemo(
      () => ({ ...motion.errors, ...orientation.errors, ...geolocation.errors }),
      [motion.errors, orientation.errors, geolocation.errors]
    ),
    isListening: useMemo(
      () => motion.isListening || orientation.isListening || geolocation.isListening,
      [motion.isListening, orientation.isListening, geolocation.isListening]
    ),
    startListening: useCallback(async () => {
      await Promise.all([motion.startListening(), orientation.startListening(), geolocation.startListening()])
    }, [motion.startListening, orientation.startListening, geolocation.startListening])
  }
}
