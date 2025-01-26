import useRawSensorData from '../../use-raw-sensor-data'

import useIIRFilter from './useIIRFilter'

export default function useIIRFData(config = {}) {
  const { rawSensorData, refreshRates, errors, isListening, startListening } = useRawSensorData(config)
  return {
    iirfData: useIIRFilter(isListening, rawSensorData),
    rawSensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
