import { useEffect, useState } from 'react'

import useRawSensorData from '../../use-raw-sensor-data'

import useIIRFilter from './useIIRFilter'

export default function useIIRFData(config = {}) {
  const { rawSensorData, refreshRates, errors, isListening, startListening } = useRawSensorData(config)

  const [refreshRate, setRefreshRate] = useState(null)
  useEffect(() => setRefreshRate(Math.ceil(Math.max(...Object.values(refreshRates)))), [refreshRates])

  return {
    iirfData: useIIRFilter(refreshRate, isListening, rawSensorData),
    rawSensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
