import { useEffect, useState } from 'react'

import useRawSensorData from '../../use-raw-sensor-data'

import useIIRFilter from './useIIRFilter'

export default function useIIRFData(config = {}) {
  const { rawSensorData, refreshRates, errors, isListening, startListening } = useRawSensorData(config)

  const [refreshRate, setRefreshRate] = useState(null)
  useEffect(() => setRefreshRate(Math.round(Math.max(refreshRates.motion, refreshRates.orientation))), [refreshRates])

  return {
    iirfData: useIIRFilter(refreshRate, isListening, rawSensorData),
    rawSensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
