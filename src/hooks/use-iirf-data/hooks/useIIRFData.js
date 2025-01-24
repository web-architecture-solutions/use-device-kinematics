import useRawSensorData from '../../use-raw-sensor-data'

import useIIRFilter from './useIIRFilter'

export default function useIIRFData(config = {}) {
  const { rawSensorData, refreshRates, errors, isListening, startListening } = useRawSensorData(config)

  const iirfData = useIIRFilter(rawSensorData, isListening)

  return {
    iirfData,
    rawSensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
