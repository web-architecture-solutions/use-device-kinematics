import { useEffect, useMemo, useState } from 'react'

import usePrevious from '../../hooks/usePrevious'
import useClock from '../../hooks/useClock'
import useSensorData from './useSensorData'

export default function useSensorDataWithDerivatives(options) {
  const [sensorDataIsReady, setSensorDataIsReady] = useState(false)
  const [derivativesWrtT, setDerivativesWrtT] = useState({})

  const previousDerivativesWrtT = usePrevious(derivativesWrtT, {})

  const { timestamp, previousTimestamp } = useClock(sensorDataIsReady)
  const deltaT = useMemo(() => timestamp - previousTimestamp, [timestamp, previousTimestamp])

  const { sensorData, previousSensorData, errors, isListening, startListening } = useSensorData(options, deltaT, previousDerivativesWrtT)

  useEffect(() => {
    setSensorDataIsReady(sensorData.isReady)
    setDerivativesWrtT(sensorData.derivativesWrtT)
  }, [sensorData])

  return { sensorData, previousSensorData, errors, isListening, startListening }
}
