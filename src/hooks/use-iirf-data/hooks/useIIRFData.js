import useRawSensorData from '../../use-raw-sensor-data'
import useDynamicRefreshRate from './useDynamicRefreshRate'
import useIIRFilter from './useIIRFilter'

export default function useIIRFData(config = {}) {
  const { rawSensorData, refreshRates, errors, isListening, startListening } = useRawSensorData(config)
  return {
    iirfData: useIIRFilter(useDynamicRefreshRate(refreshRates), isListening, rawSensorData),
    rawSensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
