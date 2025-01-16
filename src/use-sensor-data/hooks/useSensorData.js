import { useMemo, useState, useEffect } from 'react'

import usePrevious from '../../hooks/usePrevious'
import useClock from '../../hooks/useClock'
import useRawSensorData from './useRawSensorData'

import SensorData from '../SensorData'

const renameComponents = {
  position: { latitude: 'y', longitude: 'x', altitude: 'z' },
  orientation: { alpha: 'yaw', beta: 'pitch', gamma: 'roll' },
  angularVelocity: { alpha: 'z', beta: 'x', gamma: 'y' }
}

export default function useSensorData(config = {}) {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)
  const [derivativesWrtT, setDerivativesWrtT] = useState({})

  const { rawSensorData, errors, isListening, startListening } = useRawSensorData(config)
  const previousRawSensorData = usePrevious(rawSensorData, SensorData.initial, SensorData.isEqual)
  const previousDerivativesWrtT = usePrevious(derivativesWrtT, {})

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)
  const deltaT = useMemo(() => timestamp - previousTimestamp, [timestamp, previousTimestamp])

  const sensorData = useMemo(() => {
    const previousSensorDataWithDerivatives = { ...previousRawSensorData, ...previousDerivativesWrtT }
    return new SensorData(rawSensorData, previousSensorDataWithDerivatives, deltaT, renameComponents)
  }, [rawSensorData, previousRawSensorData, deltaT])

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
