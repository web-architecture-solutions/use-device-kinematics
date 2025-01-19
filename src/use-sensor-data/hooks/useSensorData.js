import { useRef, useState, useMemo, useEffect } from 'react'

import useClock from '../../hooks/useClock'
import useRawSensorData from './useRawSensorData'

import SensorData from '../SensorData'

export default function useSensorData(config = {}) {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)
  const [derivativesWrtT, setDerivativesWrtT] = useState({})

  const { rawSensorData, errors, isListening, startListening } = useRawSensorData(config)

  const previousRawSensorDataRef = useRef(SensorData.initial)
  const previousDerivativesWrtTRef = useRef({})

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)

  const sensorData = useMemo(
    () => new SensorData(rawSensorData, previousRawSensorDataRef.current, previousDerivativesWrtTRef.current, timestamp, previousTimestamp),
    [rawSensorData]
  )

  useEffect(() => {
    setSensorDataIsReady(sensorData.isReady)
    setDerivativesWrtT(sensorData.derivativesWrtT)
  }, [sensorData])

  useEffect(() => {
    previousRawSensorDataRef.current = rawSensorData
    previousDerivativesWrtTRef.current = derivativesWrtT
  }, [rawSensorData, derivativesWrtT])

  return {
    sensorData,
    errors,
    isListening,
    startListening
  }
}
