import useRawSensorData from '../../use-raw-sensor-data'
import useIIRFilter from './useIIRFilter'

export default function useSensorData(config = {}) {
  const { refreshRates, rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  const sensorData = useIIRFilter(rawSensorData, isListening)

  return {
    rawSensorData,
    sensorData,
    refreshRates,
    errors,
    isListening,
    startListening
  }
}
