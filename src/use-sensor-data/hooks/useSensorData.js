import { useMemo, useState, useEffect } from 'react'

import usePrevious from '../../hooks/usePrevious'
import useClock from '../../hooks/useClock'
import useRawSensorData from './useRawSensorData'

import SensorData from '../SensorData'

export default function useSensorData(config = {}) {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)
  const [derivativesWrtT, setDerivativesWrtT] = useState({})

  const { rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  const previousRawSensorData = usePrevious(rawSensorData, SensorData.initial, SensorData.isEqual)
  const previousDerivativesWrtT = usePrevious(derivativesWrtT, {})

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)

  const sensorData = useMemo(() => {
    return new SensorData(rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp)
  }, [rawSensorData, previousRawSensorData, previousDerivativesWrtT, timestamp, previousTimestamp])

  useEffect(() => {
    setSensorDataIsReady(sensorData.isReady)
    setDerivativesWrtT(sensorData.derivativesWrtT)
  }, [sensorData])

  return {
    sensorData,
    errors,
    isListening,
    startListening
  }
}
