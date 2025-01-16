import useSensorData from './useSensorData'

import { useEffect, useState } from 'react'

import usePrevious from '../../hooks/usePrevious'

export default function useSensorDataWithDerivatives(options, deltaT) {
  const [derivativesWrtT, setDerivativesWrtT] = useState({})
  const previousDerivativesWrtT = usePrevious(derivativesWrtT, {})

  const { sensorData, previousSensorData, errors, isListening, startListening } = useSensorData(options, deltaT, previousDerivativesWrtT)

  useEffect(() => {
    setDerivativesWrtT(sensorData.derivativesWrtT)
  }, [sensorData])

  return { sensorData, previousSensorData, errors, isListening, startListening }
}
