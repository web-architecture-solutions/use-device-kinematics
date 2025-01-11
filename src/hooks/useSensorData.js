import { useCallback, useMemo } from 'react'

import useDeviceMotion from './useDeviceMotion'
import useDeviceOrienation from './useDeviceOrientation'
import useGeolocation from './useGeolocation'

import useClock from './useClock'

//import useHeading from './useHeading'

export default function useSensorData(config = {}) {
  // TODO: Start clock once data's loaded
  const [timestamp, previousTimestamp] = useClock()

  const motion = useDeviceMotion(config)
  const orientation = useDeviceOrienation(config)
  const geolocation = useGeolocation(config)

  //const heading = useHeading(orientation.data?.alpha)

  const calculatedData = useMemo(() => ({}), [])

  const data = useMemo(
    () => ({
      ...motion?.data,
      ...orientation?.data,
      ...geolocation?.data,
      ...calculatedData
    }),
    [motion.data, orientation.data, geolocation.data, calculatedData]
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
    data,
    errors,
    isListening,
    startListening
  }
}
